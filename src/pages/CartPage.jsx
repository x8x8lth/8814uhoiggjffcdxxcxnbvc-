import React, { useState } from 'react'
import { 
  Box, Heading, Text, VStack, HStack, Button, Input, Divider, 
  FormControl, FormLabel, Image, Center, Flex, IconButton, useToast,
  Radio, RadioGroup, Stack, Select, List, ListItem, Spinner, SimpleGrid, Textarea,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Switch, Grid, Badge 
} from '@chakra-ui/react'
import { DeleteIcon, ArrowBackIcon, AddIcon, MinusIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext' 
import { searchCity, getWarehouses } from '../novaPoshta'
import { doc, updateDoc, increment } from "firebase/firestore" 
import { db } from '../firebase'

function CartPage() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, totalPrice, clearCart } = useCart()
  const { currentUser, userData } = useAuth() 
  const toast = useToast()
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [usePoints, setUsePoints] = useState(false)

  const [formData, setFormData] = useState({
    lastName: '', firstName: '', middleName: '', 
    email: '', phone: '', telegram: '', comment: '',     
    payment: 'cod', cityRef: '', cityName: '', department: '',
  })

  const [cities, setCities] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false)

  const potentialPoints = cart.reduce((acc, item) => acc + (item.points || 0) * (item.quantity || 1), 0)
  const pointsToEarn = usePoints ? 0 : potentialPoints
  const userBalance = userData?.balance || 0
  const discount = usePoints ? Math.min(userBalance, totalPrice) : 0
  const finalPrice = totalPrice - discount

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCityChange = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, cityName: value, cityRef: '', department: '' })); 
    setWarehouses([]);
    if (value.length > 2) {
      setIsSearching(true);
      const results = await searchCity(value);
      setCities(results);
      setIsSearching(false);
    } else {
      setCities([]);
    }
  }

  const selectCity = async (city) => {
    setFormData(prev => ({ ...prev, cityName: city.label, cityRef: city.value }));
    setCities([]); 
    setIsLoadingWarehouses(true);
    const deps = await getWarehouses(city.value);
    setWarehouses(deps);
    setIsLoadingWarehouses(false);
  }

  const showPinkToast = (title, status = 'error') => {
    toast({
      position: 'top',
      duration: 3000,
      render: () => (
        <Box
          color="white"
          p={4}
          bg={status === 'error' ? '#FF0080' : 'black'}
          borderRadius="xl"
          boxShadow="0px 4px 15px rgba(255, 0, 128, 0.4)"
          border="2px solid white"
          textAlign="center"
          minW="300px"
        >
          <Flex align="center" justify="center" direction="column">
            <WarningIcon w={6} h={6} mb={2} color="white" />
            <Text fontWeight="800" fontSize="lg" textTransform="uppercase">
              {title}
            </Text>
          </Flex>
        </Box>
      ),
    })
  }

  const handleOrder = async () => {
    if (cart.length === 0) return

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.cityName || !formData.department) {
      showPinkToast("Заповніть всі поля! 😡", "error")
      return
    }

    const TELEGRAM_TOKEN = import.meta.env.VITE_TELEGRAM_TOKEN;
    const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    const cartItemsText = cart.map(i => {
        let optionsText = '';
        if (i.selectedOptions && i.selectedOptions.length > 0) {
            optionsText = `\n   └ ➕ ${i.selectedOptions.map(o => o.name).join(', ')}`;
        }
        return `— ${i.name} (${i.quantity} шт) - ${i.price} грн${optionsText}`;
    }).join('\n');

    const text = `
🔥 *НОВЕ ЗАМОВЛЕННЯ!*
👤 *Клієнт:* ${formData.lastName} ${formData.firstName}
📞 *Телефон:* ${formData.phone}
✈️ *Telegram:* ${formData.telegram || '-'}

💰 *СУМА:* ${totalPrice} грн
🎁 *Бали:* ${usePoints ? `Списано ${discount} (нові не нараховані)` : 'Не списано'}
💵 *ДО СПЛАТИ:* ${finalPrice} грн
⭐ *Нарахувати:* +${pointsToEarn} балів

🚚 *Доставка:* ${formData.cityName}, ${formData.department}
💳 *Оплата:* ${formData.payment === 'cod' ? 'Накладений' : 'Карта'}
💬 *Комент:* ${formData.comment || "-"}

🛒 *ТОВАРИ:*
${cartItemsText}
    `;

    try {
      if (TELEGRAM_TOKEN && CHAT_ID) {
          const replyMarkup = {
            inline_keyboard: [
              [
                { text: "✅ Підтвердити", callback_data: "ORDER_CONFIRM" },
                { text: "❌ Скасувати", callback_data: "ORDER_CANCEL" }
              ]
            ]
          };

          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: CHAT_ID, 
                text: text, 
                parse_mode: 'Markdown',
                reply_markup: replyMarkup 
            })
          });
      }

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        if (usePoints && discount > 0) {
            await updateDoc(userRef, { balance: increment(-discount) });
        }
        if (pointsToEarn > 0) {
            await updateDoc(userRef, { balance: increment(pointsToEarn) });
        }
      }

      // 👇 ПРОСТО ВІДКРИВАЄМО ВІКНО (БЕЗ ОЧИЩЕННЯ КОШИКА ТУТ)
      onOpen();
      
    } catch (error) {
      console.error(error);
      showPinkToast("Помилка! Спробуйте ще раз", "error");
      onOpen();
    }
  }

  // 👇 ОЧИЩАЄМО КОШИК ТІЛЬКИ КОЛИ КОРИСТУВАЧ ЗАКРИВАЄ ВІКНО
  const handleCloseSuccess = () => {
    clearCart(); 
    onClose();
    navigate('/');
    window.location.reload(); 
  }

  if (cart.length === 0) {
    return (
      <Center h="60vh" flexDir="column" textAlign="center" px={4}>
        <Text fontSize="6xl" mb={4}>🛒💨</Text>
        <Heading mb={2} textTransform="uppercase" size="xl">Кошик порожній</Heading>
        <Button as={Link} to="/" mt={6} size="lg" bg="black" color="white" borderRadius="12px" leftIcon={<ArrowBackIcon />}>
          В КАТАЛОГ
        </Button>
      </Center>
    )
  }

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={{ base: 4, md: 8 }}>
      <Flex align="center" mb={8} justify="space-between">
        <Heading size="2xl" textTransform="uppercase">Твій Кошик</Heading>
        <Text fontWeight="bold" fontSize="xl" color="gray.500">Всього: {totalPrice} ₴</Text>
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "1.8fr 1.2fr" }} gap={8} alignItems="start">
        <VStack spacing={4} w="full">
          {cart.map((item) => {
            const currentQty = item.quantity || 1;
            const maxQty = item.stockCount || 999;
            const isMaxReached = currentQty >= maxQty;

            return (
              <Flex key={item.cartItemId} w="full" bg="white" p={4} align="center" border="2px solid black" borderRadius="16px" direction={{ base: "column", sm: "row" }} gap={{ base: 4, sm: 0 }}>
                <Box w="80px" h="80px" mr={{ base: 0, sm: 4 }} border="1px solid #eee" borderRadius="12px" p={2} flexShrink={0}>
                  <Image src={item.image} w="full" h="full" objectFit="contain" fallbackSrc="https://placehold.co/100?text=No+Img" />
                </Box>

                <VStack align={{ base: "center", sm: "start" }} flex={1} spacing={1} textAlign={{ base: "center", sm: "left" }}>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">{item.category}</Text>
                  <Heading size="sm" noOfLines={2}>{item.name}</Heading>
                  
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <Flex wrap="wrap" gap={1} justify={{ base: "center", sm: "start" }}>
                          {item.selectedOptions.map((opt, idx) => (
                              <Badge key={idx} colorScheme="purple" fontSize="0.7em" borderRadius="4px">
                                  + {opt.name}
                              </Badge>
                          ))}
                      </Flex>
                  )}

                  <Text fontWeight="900" fontSize="lg" color="black">
                    {item.price * currentQty} ₴ 
                    {!usePoints && item.points > 0 && (
                      <Text as="span" fontSize="xs" color="#FF0080" ml={2}>+{item.points * currentQty} балів</Text>
                    )}
                  </Text>
                </VStack>

                <HStack spacing={3} ml={{ base: 0, sm: 4 }}>
                  <IconButton icon={<MinusIcon w={3} h={3} />} size="sm" isRound variant="outline" border="2px solid black" onClick={() => decreaseQuantity(item.cartItemId)} isDisabled={currentQty <= 1} />
                  <Text fontWeight="bold" fontSize="lg" w="20px" textAlign="center">{currentQty}</Text>
                  <IconButton 
                    icon={<AddIcon w={3} h={3} />} 
                    size="sm" isRound variant="outline" 
                    border="2px solid black" 
                    onClick={() => increaseQuantity(item.cartItemId)} 
                    isDisabled={isMaxReached} 
                  />
                </HStack>

                <IconButton icon={<DeleteIcon />} variant="ghost" colorScheme="red" size="lg" ml={{ base: 0, sm: 2 }} onClick={() => removeFromCart(item.cartItemId)} borderRadius="12px" />
              </Flex>
            )
          })}
        </VStack>

        <Box position={{ lg: "sticky" }} top="100px" h="fit-content"> 
           <Box bg="white" border="2px solid black" borderRadius="24px" p={6} mb={6}>
            <Heading size="md" mb={6} textTransform="uppercase" borderBottom="2px solid black" pb={4}>Оформлення</Heading>
            
            <VStack spacing={5} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={3}>📞 Контакти</Text>
                  <VStack spacing={3}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                      <CustomInput name="lastName" label="Прізвище" placeholder="Петров" value={formData.lastName} onChange={handleInputChange} />
                      <CustomInput name="firstName" label="Ім'я" placeholder="Іван" value={formData.firstName} onChange={handleInputChange} />
                      <CustomInput name="middleName" label="По батькові" placeholder="Іванович" value={formData.middleName} onChange={handleInputChange} />
                    </SimpleGrid>
                    <CustomInput name="phone" label="Телефон" placeholder="+380 99 000 00 00" value={formData.phone} onChange={handleInputChange} />
                    <CustomInput name="telegram" label="Telegram (не обов'язково)" placeholder="@username" value={formData.telegram} onChange={handleInputChange} />
                    <CustomInput name="email" label="Ел. пошта" placeholder="mail@gmail.com" value={formData.email} onChange={handleInputChange} />
                  </VStack>
                </Box>

                <Divider borderColor="gray.300" />

                <Box>
                  <HStack mb={3}><Text fontWeight="bold">🚚 Доставка</Text><Text fontSize="xs" bg="red.500" color="white" px={2} py={0.5} borderRadius="md" fontWeight="bold">NOVA POSHTA</Text></HStack>
                  <VStack spacing={3}>
                    <FormControl position="relative">
                        <FormLabel fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.500" mb={1}>Місто</FormLabel>
                        <Input placeholder="Почніть вводити..." value={formData.cityName} onChange={handleCityChange} bg="gray.50" borderRadius="12px" border="2px solid #e2e8f0" h="50px" _focus={{ borderColor: "black", bg: "white" }} />
                        {isSearching && <Spinner position="absolute" right="10px" top="35px" size="sm" />}
                        {cities.length > 0 && (
                          <List position="absolute" w="full" bg="white" border="2px solid black" borderRadius="12px" zIndex={10} mt={1} maxHeight="200px" overflowY="auto" boxShadow="lg">
                            {cities.map((city) => (
                              <ListItem key={city.value} p={3} borderBottom="1px solid #eee" cursor="pointer" _hover={{ bg: "gray.100" }} onClick={() => selectCity(city)}>{city.label}</ListItem>
                            ))}
                          </List>
                        )}
                    </FormControl>
                    <FormControl isDisabled={!formData.cityRef}>
                      <FormLabel fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.500" mb={1}>Відділення</FormLabel>
                      <Select placeholder={isLoadingWarehouses ? "Завантажую..." : "Оберіть відділення"} bg="gray.50" borderRadius="12px" border="2px solid #e2e8f0" h="50px" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                        {warehouses.map((wh) => <option key={wh.value} value={wh.value}>{wh.label}</option>)}
                      </Select>
                    </FormControl>
                  </VStack>
                </Box>

                <Divider borderColor="gray.300" />

                <FormControl>
                  <FormLabel fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.500" mb={1}>Коментар</FormLabel>
                  <Textarea name="comment" value={formData.comment} onChange={handleInputChange} placeholder="..." bg="gray.50" borderRadius="12px" border="2px solid #e2e8f0" resize="none" />
                </FormControl>

                <Divider borderColor="gray.300" />

                <Box>
                  <Text fontWeight="bold" mb={3}>💳 Оплата</Text>
                  <RadioGroup onChange={(val) => setFormData({...formData, payment: val})} value={formData.payment}>
                    <Stack direction='column' spacing={3}>
                      <Radio value='cod' colorScheme="pink" size="lg"><Text fontSize="sm">Накладений платіж <Text as="span" color="gray.500">(передоплата 150 грн)</Text></Text></Radio>
                      <Radio value='card' colorScheme="pink" size="lg"><Text fontSize="sm">На картку</Text></Radio>
                    </Stack>
                  </RadioGroup>
                </Box>

                <Divider borderColor="black" borderBottomWidth="2px" opacity={1} mt={2} />

                {currentUser && userBalance > 0 && (
                    <Box bg="gray.50" p={4} borderRadius="16px">
                        <Flex justify="space-between" align="center" mb={2}>
                            <Text fontWeight="bold">Ваші бали: {userBalance}</Text>
                            <Switch 
                                size="lg" 
                                isChecked={usePoints} 
                                onChange={(e) => setUsePoints(e.target.checked)}
                                sx={{
                                    'span.chakra-switch__track': { bg: 'black' },
                                    'span.chakra-switch__track[data-checked]': { bg: '#FF0080' }
                                }}
                            />
                        </Flex>
                        <Text fontSize="sm" color="gray.500">Списати {Math.min(userBalance, totalPrice)} балів?</Text>
                        {usePoints && <Text fontSize="xs" color="red.400" mt={1}>* При списанні балів нові бали за це замовлення не нараховуються.</Text>}
                    </Box>
                )}

                <VStack spacing={2} align="stretch">
                    <Flex justify="space-between"><Text color="gray.500">Сума:</Text><Text fontWeight="bold">{totalPrice} ₴</Text></Flex>
                    {usePoints && discount > 0 && (
                        <Flex justify="space-between" color="#FF0080"><Text>Знижка балами:</Text><Text fontWeight="bold">- {discount} ₴</Text></Flex>
                    )}
                    
                    {currentUser && (
                          <Flex justify="space-between" color={usePoints ? "gray.400" : "#FF0080"}>
                             <Text>Буде нараховано:</Text>
                             <Text fontWeight="bold">
                                  {usePoints ? "0 (при списанні)" : `+ ${pointsToEarn} балів`}
                             </Text>
                          </Flex>
                    )}

                    <Divider />
                    <Flex justify="space-between" fontSize="xl" fontWeight="900"><Text>ДО СПЛАТИ:</Text><Text>{finalPrice} ₴</Text></Flex>
                </VStack>

                <Button w="full" h="60px" bg="#FF0080" color="white" fontSize="xl" borderRadius="16px" _hover={{ bg: "black" }} onClick={handleOrder}>ПІДТВЕРДИТИ</Button>
            </VStack>
           </Box>
        </Box>
      </Grid>

      <Modal isOpen={isOpen} onClose={handleCloseSuccess} isCentered size="lg" closeOnOverlayClick={false}>
        <ModalOverlay backdropFilter="blur(5px)" bg="rgba(0,0,0,0.6)" />
        <ModalContent border="2px solid black" borderRadius="24px" p={6} textAlign="center">
          
          <ModalHeader fontSize="2xl" textTransform="uppercase" color="#FF0080">
            <CheckCircleIcon w={12} h={12} mb={4} color="#FF0080" display="block" mx="auto" />
            Замовлення Прийнято! 🚀
          </ModalHeader>
          
          <ModalBody>
            <Text fontSize="lg" mb={4} fontWeight="bold">Дякуємо, {formData.firstName}!</Text>
            <Text color="gray.600" mb={6}>Менеджер зв'яжеться з вами найближчим часом.</Text>
            
            {currentUser && pointsToEarn > 0 && (
                <Box bg="#FF0080" color="white" p={3} borderRadius="12px" fontWeight="bold">
                    Вам нараховано +{pointsToEarn} балів! 🎉
                </Box>
            )}
          </ModalBody>
          
          <ModalFooter justifyContent="center">
            <Button bg="black" color="white" size="lg" borderRadius="12px" _hover={{ bg: "gray.800" }} onClick={handleCloseSuccess}>
                НА ГОЛОВНУ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  )
}

const CustomInput = ({ label, placeholder, name, value, onChange }) => (
  <FormControl>
    <FormLabel fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.500" mb={1}>{label}</FormLabel>
    <Input name={name} value={value} onChange={onChange} placeholder={placeholder} bg="gray.50" borderRadius="12px" border="2px solid #e2e8f0" h="50px" _focus={{ borderColor: "black", bg: "white" }} />
  </FormControl>
)

export default CartPage