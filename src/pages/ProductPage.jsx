import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Box, Container, Grid, Image, Heading, Text, Button, Flex, 
  Badge, Divider, VStack, SimpleGrid, Spinner, Center,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Menu, MenuButton, MenuList, MenuItem, HStack,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Switch, FormControl, FormLabel
} from '@chakra-ui/react'
import { ChevronRightIcon, CheckCircleIcon, WarningIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { useCart } from '../context/CartContext'
import { fetchProducts } from '../sheets'
import ProductCard from '../components/ProductCard'
import ProductReviews from '../components/ProductReviews'

const ADDONS = [
    { id: 'glycerin', name: 'Гліцерин', price: 0, defaultChecked: true },
    { id: 'ice', name: 'Ice booster', price: 30, defaultChecked: false },
    { id: 'sour', name: 'Sour booster', price: 30, defaultChecked: false },
]

const getVariantLabel = (p) => {
  if (!p) return "Варіант"
  if (p.category === 'parts') {
    if (p.resistance) return `${p.resistance} Ом`
    if (p.volume) return `${p.volume} мл`
    return p.name
  }
  return p.flavor || p.color || p.name
}

function ProductPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState(null)
  const [allData, setAllData] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  const [addonsState, setAddonsState] = useState(
    ADDONS.reduce((acc, item) => ({ ...acc, [item.id]: item.defaultChecked }), {})
  )

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setQty(1)
    setAddonsState(ADDONS.reduce((acc, item) => ({ ...acc, [item.id]: item.defaultChecked }), {}))
    
    fetchProducts().then(data => {
      setAllData(data)
      const found = data.find(p => String(p.id).trim() === String(id).trim())
      setProduct(found)
      setLoading(false)
    })
  }, [id])

  const variants = useMemo(() => {
    if (!product || !product.groupId || allData.length === 0) return []

    let siblings = allData.filter(p => 
      p.groupId === product.groupId &&      
      p.category === product.category 
    )

    if (siblings.length <= 1) return []

    return siblings.sort((a, b) => {
       const labelA = getVariantLabel(a)
       const labelB = getVariantLabel(b)
       return labelA.localeCompare(labelB, undefined, { numeric: true })
    })

  }, [product, allData])

  const relatedProducts = useMemo(() => {
    if (!product || allData.length === 0) return []
    return allData
      .filter(p => p.category === product.category && p.groupId !== product.groupId)
      .slice(0, 4)
  }, [product, allData])

  const handleBuy = () => {
    if (product) {
        const selectedOptions = ADDONS.filter(addon => addonsState[addon.id])
        addToCart(product, parseInt(qty), selectedOptions)
    }
  }

  const handleAddonChange = (id) => {
      setAddonsState(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const currentPrice = product ? (
      parseInt(product.price) + ADDONS.reduce((sum, addon) => addonsState[addon.id] ? sum + addon.price : sum, 0)
  ) : 0

  if (loading) return <Center h="80vh"><Spinner size="xl" thickness='4px' /></Center>
  if (!product) return <Center h="50vh"><Heading>Товар не знайдено 😢</Heading></Center>

  const stockCount = product.stockCount !== undefined ? product.stockCount : 999;
  const isOutOfStock = product.inStock === false || stockCount === 0
  const currentVariantLabel = getVariantLabel(product)

  let selectionTitle = "Оберіть варіант:"
  if (product.category === 'liquids') selectionTitle = "Оберіть смак:"
  if (product.category === 'pods') selectionTitle = "Оберіть колір:"
  if (product.category === 'parts') selectionTitle = "Оберіть опір/тип:"

  return (
    <Container maxW="container.xl" py={8}>
      
      <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.400' />} mb={6} fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
        <BreadcrumbItem><BreadcrumbLink as={Link} to='/'>Головна</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbItem>
            <BreadcrumbLink as={Link} to={`/category/${product.category}`}>
               {product.category === 'pods' ? 'Pod Системи' : product.category === 'liquids' ? 'Рідини' : product.category === 'parts' ? 'Комплектуючі' : 'Каталог'}
            </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage><BreadcrumbLink color="black">{product.fullName}</BreadcrumbLink></BreadcrumbItem>
      </Breadcrumb>

      <Grid templateColumns={{ base: "1fr", md: "500px 1fr" }} gap={{ base: 8, md: 12 }}>
        
        {/* ФОТО */}
        <Box>
          <Box 
            position="relative" border="2px solid black" borderRadius="24px" overflow="hidden" 
            bg="white" p={6} h={{ base: "350px", md: "500px" }} display="flex" align="center" justify="center"
          >
            <VStack position="absolute" top="15px" left="15px" align="start" spacing={2} zIndex={2}>
                {product.label && product.label.toLowerCase().includes('sale') && (
                   <Badge bg="white" color="#FF0080" border="1px solid #FF0080" px={3} py={1} borderRadius="8px" fontSize="sm">ЗНИЖКА ⚡</Badge>
                )}
                {product.label && product.label.toLowerCase().includes('new') && (
                   <Badge bg="white" color="#FF0080" border="1px solid #FF0080" px={3} py={1} borderRadius="8px" fontSize="sm">NEW 🔥</Badge>
                )}
                {product.label && (product.label.toLowerCase().includes('hit') || product.label.toLowerCase().includes('top')) && (
                   <Badge bg="white" color="#FF0080" border="1px solid #FF0080" px={3} py={1} borderRadius="8px" fontSize="sm">ТОП 🚀</Badge>
                )}
            </VStack>

            <Image 
              src={product.image || null} 
              alt={product.name} w="full" h="full" objectFit="contain" 
              filter={isOutOfStock ? "grayscale(100%)" : "none"}
              fallbackSrc="https://via.placeholder.com/400?text=No+Image"
            />
          </Box>
        </Box>

        {/* ІНФО */}
        <VStack align="stretch" spacing={6}>
          
          <Box>
             <Text fontSize="sm" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>{product.brand}</Text>
             <Heading as="h1" size="xl" lineHeight="1.1" mb={2}>{product.fullName}</Heading>
             
             <Flex align="center" mt={2} color={isOutOfStock ? "red.500" : "green.500"} fontWeight="bold" fontSize="sm">
                {isOutOfStock ? <WarningIcon mr={2} /> : <CheckCircleIcon mr={2} />}
                {isOutOfStock ? "Закінчився" : `В наявності (${stockCount} шт)`}
             </Flex>
          </Box>

          <Divider borderColor="black" opacity={1} />

          {/* ВАРІАНТИ */}
          {variants.length > 1 && (
            <Box>
              <Text fontWeight="bold" mb={2} fontSize="sm" textTransform="uppercase" color="gray.500">
                 {selectionTitle}
              </Text>
              
              <Menu matchWidth>
                <MenuButton 
                  as={Button} 
                  rightIcon={<ChevronDownIcon />} 
                  w="full" h="50px" textAlign="left" bg="white"
                  border="2px solid black" borderRadius="12px"
                  _hover={{ bg: "gray.50" }} _active={{ bg: "gray.100" }}
                  fontSize="md" fontWeight="bold"
                >
                  {currentVariantLabel}
                </MenuButton>
                <MenuList 
                  zIndex={10} border="2px solid black" borderRadius="12px" 
                  boxShadow="0px 10px 20px rgba(0,0,0,0.1)" maxH="300px" overflowY="auto" 
                >
                  {variants.map((variant) => {
                    const label = getVariantLabel(variant)
                    const isActive = String(variant.id).trim() === String(product.id).trim()
                    return (
                      <MenuItem 
                        key={variant.id} 
                        onClick={() => navigate(`/product/${variant.id}`)}
                        bg={isActive ? "black" : "white"}
                        color={isActive ? "white" : "black"}
                        _hover={{ bg: "#FF0080", color: "white" }}
                        fontWeight="bold" justifyContent="space-between"
                      >
                        {label}
                        {!variant.inStock && <Badge colorScheme="red" fontSize="0.6em">Немає</Badge>}
                      </MenuItem>
                    )
                  })}
                </MenuList>
              </Menu>
            </Box>
          )}
            
          {/* 👇 БЛОК З ДОДАВАННЯМ ОПЦІЙ (Виправлений стиль) */}
          {product.category === 'liquids' && (
            <Box bg="white" p={4} borderRadius="16px" border="2px solid black"> {/* <-- СУЦІЛЬНА ЧОРНА РАМКА */}
                <Text fontWeight="bold" mb={3} fontSize="sm" textTransform="uppercase" color="gray.500">Додати до комплекту:</Text>
                <VStack align="stretch" spacing={0}>
                    {ADDONS.map((addon, index) => (
                        <Flex 
                            key={addon.id} 
                            justify="space-between" 
                            align="center" 
                            py={2} 
                            borderBottom={index !== ADDONS.length - 1 ? "1px solid #e2e8f0" : "none"}
                        >
                            <HStack>
                                <Text fontWeight="bold" fontSize="sm">{addon.name}</Text>
                                {/* 👇 НОВІ СТИЛІ ДЛЯ ЛЕЙБЛІВ */}
                                {addon.price > 0 && (
                                    <Badge bg="white" color="#FF0080" border="1px solid #FF0080" px={2} borderRadius="6px" fontSize="0.7em">
                                        +{addon.price} грн
                                    </Badge>
                                )}
                                {addon.price === 0 && (
                                    <Badge bg="black" color="white" px={2} borderRadius="6px" fontSize="0.7em">
                                        БЕЗКОШТОВНО
                                    </Badge>
                                )}
                            </HStack>
                            <Switch 
                                colorScheme="pink" 
                                size="md" 
                                isChecked={addonsState[addon.id]}
                                onChange={() => handleAddonChange(addon.id)}
                                sx={{
                                    'span.chakra-switch__track': { bg: 'gray.300' },
                                    'span.chakra-switch__track[data-checked]': { bg: 'black' }
                                }}
                            />
                        </Flex>
                    ))}
                </VStack>
            </Box>
          )}

          {/* ЦІНА ТА КНОПКИ */}
          <Box bg="gray.50" p={6} borderRadius="24px">
               {product.oldPrice && (
                  <Text textDecoration="line-through" color="gray.500" fontSize="lg" fontWeight="bold" mr={2}>
                    {product.oldPrice} ₴
                  </Text>
               )}
               
               <HStack align="center" spacing={3} mb={4}>
                  <Text fontSize="4xl" fontWeight="900" lineHeight="1">{currentPrice} <Text as="span" fontSize="lg">грн</Text></Text>
                  
                  {product.points > 0 && (
                    <Flex align="center" bg="white" border="2px solid #FF0080" px={3} py={1.5} borderRadius="12px" mt={1}>
                      <Image src="https://i.ibb.co/C3TQ0Vf2/free-icon-gift-6565290.png" boxSize="20px" mr={2} />
                      <Text fontSize="sm" fontWeight="bold" color="black">+{product.points} балів</Text>
                    </Flex>
                  )}
               </HStack>
               
               <Flex gap={3}>
                 <NumberInput 
                   size="lg" maxW="100px" min={1} max={stockCount}
                   value={qty} onChange={(val) => setQty(val)}
                   isDisabled={isOutOfStock} focusBorderColor="#FF0080"
                 >
                    <NumberInputField borderRadius="14px" fontWeight="bold" bg="white" border="2px solid black" />
                    <NumberInputStepper>
                      <NumberIncrementStepper border="none" color="black" />
                      <NumberDecrementStepper border="none" color="black" />
                    </NumberInputStepper>
                 </NumberInput>

                 <Button 
                   size="lg" h="50px" borderRadius="14px" fontSize="lg" flex={1}
                   bg={isOutOfStock ? "gray.300" : "#FF0080"} 
                   color="white"
                   _hover={!isOutOfStock && { bg: "black", transform: "translateY(-2px)" }}
                   isDisabled={isOutOfStock}
                   onClick={handleBuy}
                 >
                   {isOutOfStock ? "НЕМАЄ" : "КУПИТИ"}
                 </Button>
               </Flex>
          </Box>
          
          <Accordion allowToggle mt={4}>
            <AccordionItem borderTop="2px solid black" borderBottom="2px solid black">
               <h2><AccordionButton px={0} _hover={{ bg: 'transparent' }} py={4}><Box flex='1' textAlign='left' fontWeight="bold">ХАРАКТЕРИСТИКИ</Box><AccordionIcon /></AccordionButton></h2>
               <AccordionPanel pb={4} px={0}>
                  <SimpleGrid columns={1} spacing={2}>
                      <FeatureRow label="Бренд" value={product.brand} />
                      <FeatureRow label="Країна" value={product.country} />
                      {product.category === 'liquids' && <FeatureRow label="Смак" value={product.flavor} />}
                      {product.category === 'pods' && <FeatureRow label="Колір" value={product.color} />}
                      {(product.category === 'parts' || product.resistance) && <FeatureRow label="Опір" value={product.resistance && `${product.resistance} Ом`} />}
                      <FeatureRow label="Об'єм" value={product.volume} />
                      <FeatureRow label="Матеріал" value={product.material} />
                      <FeatureRow label="Дисплей" value={product.display} />
                  </SimpleGrid>
               </AccordionPanel>
            </AccordionItem>
             <AccordionItem borderBottom="2px solid black">
               <h2><AccordionButton px={0} _hover={{ bg: 'transparent' }} py={4}><Box flex='1' textAlign='left' fontWeight="bold">ОПИС</Box><AccordionIcon /></AccordionButton></h2>
               <AccordionPanel pb={4} px={0} color="gray.600" lineHeight="1.7">
                 {product.description || "Опис товару оновлюється."}
               </AccordionPanel>
            </AccordionItem>
          </Accordion>

        </VStack>
      </Grid>
      
      <ProductReviews product={product} />

      {relatedProducts.length > 0 && (
          <Box mt={24}>
              <Heading size="lg" mb={8} textTransform="uppercase" borderBottom="3px solid black" pb={2} display="inline-block">Вам може сподобатись</Heading>
              <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={6}>
                  {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </Grid>
          </Box>
      )}

    </Container>
  )
}

const FeatureRow = ({ label, value }) => {
    if (!value) return null
    return (
        <Flex justify="space-between" py={2} borderBottom="1px dashed #ccc">
            <Text color="gray.600" fontSize="sm" fontWeight="bold">{label}</Text>
            <Text fontWeight="normal" fontSize="sm">{value}</Text>
        </Flex>
    )
}

export default ProductPage