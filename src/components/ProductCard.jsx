import React from 'react'
import { Box, Image, Text, Badge, VStack, Flex, useToast, IconButton, HStack } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FiShoppingCart, FiBell } from 'react-icons/fi' // 👇 Додав іконку дзвіночка
import { SmallCloseIcon } from '@chakra-ui/icons' // 👇 Додав іконку хрестика
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const toast = useToast()

  // Перевірка наявності
  const stockCount = product.stockCount !== undefined ? product.stockCount : 999;
  const isOutOfStock = product.inStock === false || stockCount === 0;

  const handleBuy = (e) => {
    e.preventDefault() // Щоб не переходило на сторінку товару при кліку на кнопку
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

  // 👇 Логіка кнопки "Повідомити"
 // 👇 Логіка кнопки "Повідомити" (РОЖЕВА ВЕРСІЯ)
  const handleNotify = (e) => {
    e.preventDefault()
    toast({
      position: "top-right",
      duration: 3000,
      isClosable: true,
      // 👇 Ми використовуємо 'render', щоб зробити власний дизайн
      render: () => (
        <Box color="white" p={3} bg="#FF0080" borderRadius="12px" boxShadow="lg">
           <Text fontWeight="bold" fontSize="md">
             Сповіщення увімкнено! 🔔
           </Text>
           <Text fontSize="sm">
             Ми повідомимо вас, коли товар з'явиться.
           </Text>
        </Box>
      ),
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
      h="100%" 
    >
      {/* 👇 ЛЕЙБЛИ ЗЛІВА (Sale, New, Hit) - Показуємо навіть якщо немає в наявності (опціонально) */}
      <VStack position="absolute" top="12px" left="12px" align="start" spacing={1} zIndex={2}>
          {hasSale && (
             <Badge bg="white" color="#FF0080" border="1px solid #FF0080" px={2} py={1} borderRadius="8px" fontSize="xs" fontWeight="bold">
               ЗНИЖКА⚡
             </Badge>
          )}
          {hasNew && (
             <Badge bg="white" color="#FF0080" border="1px solid #FF0080" px={2} py={1} borderRadius="8px" fontSize="xs" fontWeight="bold">
               НОВИНКА🔥
             </Badge>
          )}
          {hasHit && (
             <Badge bg="white" color="#FF0080" border="1px solid #FF0080" px={2} py={1} borderRadius="8px" fontSize="xs" fontWeight="bold">
               ТОП🚀
             </Badge>
          )}
      </VStack>

      {/* 👇 НОВИЙ ЛЕЙБЛ "ОЧІКУЄТЬСЯ" (Зверху праворуч) */}
      {isOutOfStock && (
        <Badge 
            position="absolute" 
            top="12px" 
            right="12px" 
            bg="gray.100" 
            color="gray.500" 
            border="1px solid #CBD5E0"
            px={2} py={1} 
            borderRadius="8px" 
            fontSize="xs" 
            fontWeight="bold"
            zIndex={2}
            display="flex"
            alignItems="center"
            gap={1}
        >
            ОЧІКУЄТЬСЯ <SmallCloseIcon w={3} h={3} />
        </Badge>
      )}

      {/* Фото */}
      <Box h="220px" p={6} display="flex" alignItems="center" justifyContent="center" bg="white">
        <Image 
          src={product.image || "https://via.placeholder.com/300x300?text=No+Image"} 
          alt={product.name} 
          maxH="100%" 
          maxW="100%"
          objectFit="contain" 
          // 👇 Ефект "вицвітання": ЧБ + Напівпрозорість
          filter={isOutOfStock ? "grayscale(100%)" : "none"}
          opacity={isOutOfStock ? 0.6 : 1} 
        />
      </Box>

      {/* Контент (Текст залишається чітким) */}
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
              <Text fontSize="sm" textDecoration="line-through" color="gray.500" fontWeight="bold">
                {product.oldPrice} ₴
              </Text>
            )}
            <Text fontSize="2xl" fontWeight="900" color={isOutOfStock ? "gray.500" : "black"} lineHeight="1">
              {product.price} <Text as="span" fontSize="sm" fontWeight="bold">₴</Text>
            </Text>
          </Box>

          {/* 👇 КНОПКА: Якщо немає в наявності -> Дзвіночок, інакше -> Кошик */}
          <IconButton 
            icon={isOutOfStock ? <FiBell size={22} /> : <FiShoppingCart size={22} />}
            aria-label={isOutOfStock ? "Повідомити про наявність" : "Купити"}
            variant="outline"
            size="lg"
            h="50px" w="50px"
            border="2px solid black" // Той самий стиль бордера
            borderRadius="14px"
            color={isOutOfStock ? "gray.500" : "black"} // Сірий колір для дзвіночка
            borderColor={isOutOfStock ? "gray.400" : "black"} // Сірий бордер для відсутності
            bg="transparent"
            _hover={{ 
                bg: isOutOfStock ? "gray.100" : "black", 
                color: isOutOfStock ? "black" : "white", 
                borderColor: "black",
                transform: "scale(1.05)" 
            }}
            _active={{ transform: "scale(0.95)" }}
            onClick={isOutOfStock ? handleNotify : handleBuy}
          />
        </Flex>
      </VStack>
    </Box>
  )
}

export default ProductCard