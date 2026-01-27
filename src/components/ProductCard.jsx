import React from 'react'
import { Box, Image, Text, Badge, VStack, Flex, useToast, IconButton, Center } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FiShoppingCart } from 'react-icons/fi' 
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const toast = useToast()

  // Перевірка наявності (враховуємо кількість)
  const stockCount = product.stockCount !== undefined ? product.stockCount : 999;
  const isOutOfStock = product.inStock === false || stockCount === 0;

  const handleBuy = (e) => {
    e.preventDefault()
    if (isOutOfStock) return

    addToCart(product)
    toast({
      title: "Додано в кошик! 🛒",
      description: product.fullName || product.name,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    })
  }

  // 👇 ЛОГІКА ТЕГІВ
  const hasSale = product.label && product.label.toLowerCase().includes('sale');
  const hasNew = product.label && product.label.toLowerCase().includes('new');
  const hasHit = product.label && (product.label.toLowerCase().includes('hit') || product.label.toLowerCase().includes('top'));

  return (
    <Box 
      as={Link} 
      to={`/product/${product.id}`}
      border="2px solid black" 
      borderRadius="18px" 
      overflow="hidden" 
      position="relative"
      transition="all 0.3s"
      bg="white"
      display="flex"
      flexDirection="column"
      _hover={{ transform: "translateY(-5px)", boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      opacity={isOutOfStock ? 0.7 : 1}
      h="100%" // Щоб картки були однакової висоти
    >
      {/* 👇 ОНОВЛЕНІ ЛЕЙБЛИ (VStack щоб не накладались) */}
      {!isOutOfStock && (
        <VStack position="absolute" top="12px" left="12px" align="start" spacing={1} zIndex={2}>
            
            {/* 1. SALE -> ЗНИЖКА */}
            {hasSale && (
               <Badge 
                  bg="white" color="#FF0080" border="1px solid #FF0080" 
                  px={2} py={1} borderRadius="8px" fontSize="xs" fontWeight="bold"
               >
                 ЗНИЖКА⚡
               </Badge>
            )}

            {/* 2. NEW -> NEW */}
            {hasNew && (
               <Badge 
                  bg="white" color="#FF0080" border="1px solid #FF0080"  
                  px={2} py={1} borderRadius="8px" fontSize="xs" fontWeight="bold"
               >
                 НОВИНКА🔥
               </Badge>
            )}

            {/* 3. HIT -> ТОП */}
            {hasHit && (
               <Badge 
                  bg="white" color="#FF0080" border="1px solid #FF0080" 
                  px={2} py={1} borderRadius="8px" fontSize="xs" fontWeight="bold"
               >
                 ТОП🚀
               </Badge>
            )}
        </VStack>
      )}

      {/* Фото */}
      <Box h="220px" p={6} display="flex" alignItems="center" justifyContent="center" bg="white">
        <Image 
          src={product.image || "https://via.placeholder.com/300x300?text=No+Image"} 
          alt={product.name} 
          maxH="100%" 
          maxW="100%"
          objectFit="contain" 
          filter={isOutOfStock ? "grayscale(100%)" : "none"}
        />
      </Box>

      {/* Контент */}
      <VStack p={5} align="start" spacing={3} flex="1" justify="space-between" bg="white">
        <Box w="full">
          <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
            {product.category === 'liquids' ? 'Рідина' : 
             product.category === 'pods' ? 'Pod Система' : 
             product.category === 'kits' ? 'Стартовий набір' :
             product.category === 'parts' ? 'Комплектуючі' : product.category}
          </Text>
          
          <Text fontWeight="800" fontSize="lg" noOfLines={2} lineHeight="1.2" mt={1}>
            {product.name}
          </Text>
          
          {(product.flavor || product.color) && (
            <Text fontSize="sm" color="gray.600" noOfLines={1} mt={1}>
              {product.flavor || product.color}
            </Text>
          )}
        </Box>

        {/* Чорна тонка лінія */}
        <Box h="1px" bg="black" w="full" opacity={1} />

        <Flex w="full" justify="space-between" align="end">
          <Box>
            {product.oldPrice && (
              <Text fontSize="sm" textDecoration="line-through" color="gray.400" fontWeight="bold">
                {product.oldPrice} ₴
              </Text>
            )}
            <Text fontSize="2xl" fontWeight="900" color={isOutOfStock ? "gray.400" : "black"} lineHeight="1">
              {product.price} <Text as="span" fontSize="sm" fontWeight="bold">₴</Text>
            </Text>
          </Box>

          <IconButton 
            icon={<FiShoppingCart size={22} />}
            aria-label="Купити"
            variant="outline"
            size="lg"
            h="50px" w="50px"
            border="2px solid black"
            borderRadius="14px"
            color="black"
            bg="transparent"
            isDisabled={isOutOfStock}
            _hover={!isOutOfStock && { bg: "black", color: "white", transform: "scale(1.05)" }}
            _active={{ transform: "scale(0.95)" }}
            onClick={handleBuy}
          />
        </Flex>
      </VStack>

      {/* Лейбл "НЕМАЄ" */}
      {isOutOfStock && (
        <Center position="absolute" top={0} left={0} w="full" h="full" bg="whiteAlpha.800" zIndex={10}>
              <Badge bg="black" color="white" px={4} py={2} borderRadius="12px" fontSize="sm">НЕМАЄ В НАЯВНОСТІ</Badge>
        </Center>
      )}
    </Box>
  )
}

export default ProductCard