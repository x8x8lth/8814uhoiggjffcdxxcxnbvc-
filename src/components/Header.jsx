import React, { useRef, useState, useEffect } from 'react'
import { 
  Box, Flex, Button, Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  IconButton, HStack, useDisclosure, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalCloseButton, ModalBody, VStack,
  InputGroup, InputLeftElement, Input, InputRightElement,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  Image, Text, Avatar, useToast, List, ListItem, Badge, Divider
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiSearch, FiUser, FiShoppingBag, FiLogOut, FiTrash2, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { FaTelegram, FaGoogle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProducts } from '../sheets' 

const SEARCH_DICTIONARY = [
  ['elf bar', 'elfbar', 'ельф', 'елф', 'ельфбар', 'ельф бар'],
  ['chaser', 'чейзер', 'чесер', 'чайзер', 'чейз'],
  ['xros', 'іксрос', 'хрос', 'крос', 'xroz'],
  ['voopoo', 'вупу', 'вопу', 'драг', 'drag'],
  ['geekvape', 'гіквейп', 'гік вейп', 'sonder', 'сондер'],
  ['rf350', 'рф350', 'рф', 'rf'],
  ['liquid', 'рідина', 'жижа', 'сольова'],
  ['cartridge', 'картридж', 'катридж', 'іспарік', 'випарник']
];

const getSmartQueries = (input) => {
  const lowerInput = input.toLowerCase().trim();
  let terms = [lowerInput];

  SEARCH_DICTIONARY.forEach(group => {
    if (group.some(word => lowerInput.includes(word))) {
      terms = [...terms, ...group];
    }
  });
  return terms;
}

// 👇 ОНОВЛЕНИЙ ПЕРЕКЛАДАЧ ПОМИЛОК (ТЕПЕР ДЛЯ ВСІХ ВИПАДКІВ)
const getFriendlyErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/missing-password':
      return "ВИ НЕ ВВЕЛИ ПАРОЛЬ 🔑";
    case 'auth/wrong-password':
      return "НЕВІРНИЙ ПАРОЛЬ ❌";
    case 'auth/user-not-found':
      return "ТАКОГО АКАУНТУ НЕ ІСНУЄ 🤷‍♂️";
    case 'auth/invalid-email':
      return "НЕКОРЕКТНИЙ EMAIL 📧";
    case 'auth/email-already-in-use':
      return "EMAIL ВЖЕ ЗАРЕЄСТРОВАНИЙ ✋";
    case 'auth/too-many-requests':
      return "ЗАБАГАТО СПРОБ. ЗАЧЕКАЙТЕ ХВИЛИНУ ⏳";
    case 'auth/weak-password':
      return "ПАРОЛЬ МАЄ БУТИ ВІД 6 СИМВОЛІВ 🔓";
    case 'auth/popup-closed-by-user':
      return "ВИ ЗАКРИЛИ ВІКНО ВХОДУ 🚪";
    case 'auth/network-request-failed':
      return "ПЕРЕВІРТЕ ІНТЕРНЕТ З'ЄДНАННЯ 🌐";
    case 'auth/user-disabled':
      return "ЦЕЙ АКАУНТ ЗАБЛОКОВАНО 🚫";
    case 'auth/operation-not-allowed':
      return "ВХІД ТИМЧАСОВО НЕДОСТУПНИЙ 🔧";
    case 'auth/credential-already-in-use':
      return "ЦЕЙ АКАУНТ ВЖЕ ПРИВ'ЯЗАНИЙ 🔗";
    case 'auth/invalid-credential':
      return "ПОМИЛКА ДАНИХ ВХОДУ ❌";
    default:
      // 👇 Якщо помилка якась дуже рідкісна, виведеться це:
      return "ЩОСЬ ПІШЛО НЕ ТАК. СПРОБУЙТЕ ЩЕ РАЗ 😔";
  }
}

function Header() {
  const { isOpen: isAuthOpen, onOpen: onAuthOpen, onClose: onAuthClose } = useDisclosure()
  const { isOpen: isCartOpen, onOpen: onCartOpen, onClose: onCartClose } = useDisclosure()
  const btnRef = useRef()
  const toast = useToast()
  const navigate = useNavigate()

  const { currentUser, userData, loginWithGoogle, logout, registerWithEmail, loginWithEmail } = useAuth()
  const { cart, decreaseQuantity, totalPrice } = useCart()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoginMode, setIsLoginMode] = useState(true)

  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const searchInputRef = useRef(null)

  useEffect(() => {
    fetchProducts().then(data => setAllProducts(data))
  }, [])

  const handleSearchInput = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 1) {
      const searchTerms = getSmartQueries(query);
      const filtered = allProducts.filter(p => {
        const pName = p.name.toLowerCase();
        const pBrand = p.brand?.toLowerCase() || '';
        return searchTerms.some(term => pName.includes(term) || pBrand.includes(term));
      }).slice(0, 5)
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`)
      setIsSearchActive(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive)
    if (!isSearchActive) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    } else {
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleResultClick = (id) => {
    navigate(`/product/${id}`)
    setIsSearchActive(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const showAuthToast = (title, status = 'success') => {
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
            minW="250px"
          >
            <Flex align="center" justify="center" direction="column">
              {status === 'success' ? <FiCheckCircle size={24} /> : <FiAlertCircle size={24} />}
              <Text fontWeight="800" fontSize="md" mt={2} textTransform="uppercase">
                {title}
              </Text>
            </Flex>
          </Box>
        ),
      })
  }

  const handleGoogleLogin = async () => { 
      try { 
          await loginWithGoogle(); 
          onAuthClose(); 
          showAuthToast("Успішний вхід! 👋", "success");
      } catch (error) { 
          // 👇 Використовуємо перекладач помилок
          const message = getFriendlyErrorMessage(error.code);
          showAuthToast(message, "error");
      } 
  }
  
  const handleEmailAuth = async () => { 
      try { 
          if (isLoginMode) await loginWithEmail(email, password); 
          else await registerWithEmail(email, password, name); 
          onAuthClose(); 
          showAuthToast(isLoginMode ? "Раді бачити! 👋" : "Вітаємо в клубі! 🚀", "success");
      } catch (error) { 
          // 👇 Використовуємо перекладач помилок
          const message = getFriendlyErrorMessage(error.code);
          showAuthToast(message, "error");
      } 
  }
  
  const handleLogout = async () => { 
      await logout(); 
      showAuthToast("Ви вийшли з акаунту", "success");
  }

  return (
    <>
      <Box bg="black" px={4} py={2} color="white" position="sticky" top={0} zIndex={100} boxShadow="md" h="60px">
        
        {isSearchActive ? (
          <Flex align="center" h="100%" w="full" maxW="container.md" mx="auto" position="relative">
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none"><FiSearch color="gray.500" /></InputLeftElement>
              <Input 
                ref={searchInputRef}
                placeholder="Пошук (напр. чейзер, ельф бар...)" 
                bg="white" color="black" borderRadius="12px"
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyDown={handleSearchSubmit}
                _focus={{ boxShadow: "0 0 0 2px #FF0080" }}
              />
              <InputRightElement>
                  <IconButton icon={<FiX />} size="sm" variant="ghost" color="black" onClick={toggleSearch} />
              </InputRightElement>
            </InputGroup>

            {searchResults.length > 0 && (
              <Box 
                position="absolute" top="50px" left="0" right="0" 
                bg="white" color="black" borderRadius="16px" 
                boxShadow="xl" border="2px solid black" overflow="hidden" zIndex={200}
              >
                <List spacing={0}>
                  {searchResults.map(product => (
                    <ListItem 
                      key={product.id} 
                      p={3} borderBottom="1px solid #eee" 
                      _hover={{ bg: "gray.50", cursor: "pointer" }}
                      onClick={() => handleResultClick(product.id)}
                    >
                      <Flex align="center">
                        <Image src={product.image} boxSize="40px" objectFit="contain" mr={3} borderRadius="md" fallbackSrc="https://placehold.co/40" />
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{product.name}</Text>
                          <Text fontSize="xs" color="gray.500">{product.price} ₴</Text>
                        </Box>
                      </Flex>
                    </ListItem>
                  ))}
                  <ListItem p={2} bg="gray.100" textAlign="center" cursor="pointer" onClick={() => handleSearchSubmit({ key: 'Enter' })}>
                      <Text fontSize="xs" fontWeight="bold" color="#FF0080">Переглянути всі результати</Text>
                  </ListItem>
                </List>
              </Box>
            )}
          </Flex>
        ) : (
          <Flex alignItems="center" justifyContent="space-between" h="100%">
            <HStack spacing={1} flex={1}>
              <Menu>
                <MenuButton as={IconButton} icon={<FiMenu size="24px" />} variant="ghost" colorScheme="whiteAlpha" aria-label="Каталог" />
                
                <MenuList color="black" zIndex={101} border="2px solid black" borderRadius="12px" p={2} mt={2}>
                    <MenuItem as={Link} to="/category/sales" icon={<Image src="https://i.ibb.co/yHz9Wvx/free-icon-promotions-372754.png" boxSize="20px" />} fontWeight="bold" mb={1}>
                        Акції
                    </MenuItem>
                    <MenuItem as={Link} to="/category/new" icon={<Image src="https://i.ibb.co/1YdtLqwv/free-icon-new-7244706.png" boxSize="20px" />} fontWeight="bold" mb={1}>
                        Новинки
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem as={Link} to="/category/kits" icon={<Image src="https://i.ibb.co/YT8NHh3w/free-icon-vape-liquid-1686684.png" boxSize="20px" />}>
                        Стартові набори
                    </MenuItem>
                    <MenuItem as={Link} to="/category/liquids" icon={<Image src="https://i.ibb.co/kVwGp6Xk/free-icon-vape-liquid-4811021.png" boxSize="20px" />}>
                        Рідини
                    </MenuItem>
                    <MenuItem as={Link} to="/category/pods" icon={<Image src="https://i.ibb.co/sJzf4hxW/free-icon-pod-12314028.png" boxSize="20px" />}>
                        Pod системи
                    </MenuItem>
                    <MenuItem as={Link} to="/category/parts" icon={<Image src="https://i.ibb.co/v4wJCDdG/free-icon-cartridge-3757178.png" boxSize="20px" />}>
                        Комплектуючі
                    </MenuItem>
                </MenuList>
              </Menu>
              <IconButton icon={<FiSearch size="22px" />} variant="ghost" colorScheme="whiteAlpha" onClick={toggleSearch} />
            </HStack>

            <Box as={Link} to="/" position={{ base: "relative", md: "absolute" }} left={{ base: "0", md: "50%" }} transform={{ base: "none", md: "translateX(-50%)" }}>
              <Image src="https://i.ibb.co/pvm42BVB/image-2026-01-13-13-02-52-1.png" alt="Smoke House" h="55px" objectFit="contain" />
            </Box>

            <HStack spacing={1} flex={1} justify="flex-end">
               <Button as={Link} to="/about" variant="ghost" colorScheme="whiteAlpha" size="sm" display={{ base: 'none', md: 'flex' }} fontWeight="normal">Про нас</Button>
               <Button as={Link} to="/contacts" variant="ghost" colorScheme="whiteAlpha" size="sm" display={{ base: 'none', md: 'flex' }} fontWeight="normal">Контакти</Button>
              
              {currentUser ? (
                <Menu>
                  <MenuButton as={IconButton} icon={<Avatar size="xs" src={currentUser.photoURL} name={currentUser.displayName} border="1px solid white" />} variant="ghost" />
                  <MenuList color="black" border="2px solid black" borderRadius="16px" p={2}>
                    <Box px={3} py={2} borderBottom="1px solid #eee" mb={1}>
                      <Text fontWeight="bold" fontSize="sm">{currentUser.displayName}</Text>
                      <Text fontSize="sm" fontWeight="bold" color="#FF0080" mt={1}>Баланс: {userData?.balance || 0} балів</Text>
                    </Box>
                    <MenuItem icon={<FiLogOut />} onClick={handleLogout}>Вийти</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <IconButton icon={<FiUser size="24px" />} variant="ghost" colorScheme="whiteAlpha" onClick={onAuthOpen} />
              )}
              
              <Box position="relative">
                <IconButton ref={btnRef} icon={<FiShoppingBag size="24px" />} variant="ghost" colorScheme="whiteAlpha" onClick={onCartOpen} />
                {cart.length > 0 && (
                  <Flex position="absolute" top="2px" right="2px" bg="#FF0080" w="18px" h="18px" borderRadius="full" align="center" justify="center" fontSize="10px" fontWeight="bold" border="1px solid black">
                    {cart.length}
                  </Flex>
                )}
              </Box>
            </HStack>
          </Flex>
        )}
      </Box>

      <Modal isOpen={isAuthOpen} onClose={onAuthClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(5px)" bg="rgba(0,0,0,0.4)" />
        <ModalContent border="2px solid black" borderRadius="24px" p={2}>
          <ModalHeader textAlign="center">{isLoginMode ? "ВХІД 👋" : "РЕЄСТРАЦІЯ 🚀"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={3}>
               <Button w="full" variant="outline" leftIcon={<FaGoogle />} borderRadius="12px" onClick={handleGoogleLogin}>Google</Button>
               {!isLoginMode && <Input placeholder="Ім'я" value={name} onChange={e => setName(e.target.value)} borderRadius="12px" />}
               <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} borderRadius="12px" />
               <Input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} borderRadius="12px" />
               <Button w="full" bg="#FF0080" color="white" borderRadius="12px" onClick={handleEmailAuth}>{isLoginMode ? "Увійти" : "Створити"}</Button>
               <Text fontSize="sm" cursor="pointer" onClick={() => setIsLoginMode(!isLoginMode)} textAlign="center" mt={2}>{isLoginMode ? "Реєстрація" : "Вхід"}</Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Drawer isOpen={isCartOpen} placement='right' onClose={onCartClose} finalFocusRef={btnRef} size="sm">
        <DrawerOverlay backdropFilter="blur(2px)" />
        <DrawerContent borderLeft="2px solid black" borderTopLeftRadius="24px" borderBottomLeftRadius="24px">
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottom="2px solid black" pt={6}>Ваш кошик ({cart.length})</DrawerHeader>
          <DrawerBody p={0}>
            {cart.length === 0 ? (
              <Flex direction="column" align="center" justify="center" h="full" color="gray.500">
                <FiShoppingBag size="50px" style={{ marginBottom: '20px', opacity: 0.3 }} />
                <Text>Тут поки що пусто...</Text>
              </Flex>
            ) : (
              <VStack spacing={0} divider={<Divider borderColor="black" opacity={1} borderBottomWidth="1px" />}>
                {cart.map((item) => (
                  <Flex key={item.id} w="full" p={4} align="center" justify="space-between">
                    <Flex align="center">
                      <Image src={item.image} w="50px" h="50px" objectFit="contain" mr={4} borderRadius="8px" border="1px solid black" />
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{item.name}</Text>
                        <Text fontSize="xs" color="gray.500">{item.quantity || 1} x {item.price} ₴ = {(item.quantity || 1) * item.price} ₴</Text>
                      </Box>
                    </Flex>
                    <IconButton icon={<FiTrash2 />} size="sm" variant="ghost" colorScheme="red" onClick={() => decreaseQuantity(item.id)} />
                  </Flex>
                ))}
              </VStack>
            )}
          </DrawerBody>
          <DrawerFooter borderTop="2px solid black" pb={6} flexDirection="column" gap={3}>
            {cart.length > 0 && (
              <Flex w="full" justify="space-between" align="center" mb={2}>
                <Text fontWeight="bold">Всього:</Text>
                <Text fontWeight="900" fontSize="xl">{totalPrice} ₴</Text>
              </Flex>
            )}
            <Button variant='outline' w="full" onClick={onCartClose} borderRadius="12px" border="2px solid black">Продовжити покупки</Button>
            <Button as={Link} to="/cart" w="full" bg="#FF0080" color="white" borderRadius="12px" _hover={{ bg: "black" }} onClick={onCartClose}>Оформити замовлення</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Header