import React from 'react'
import { Box, Image, Text, Badge, VStack, Flex, useToast, IconButton } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FiShoppingCart, FiBell } from 'react-icons/fi' 
import { SmallCloseIcon, CheckCircleIcon } from '@chakra-ui/icons' 
import { useCart } from '../context/CartContext'

// 👇 МАГІЧНА ФУНКЦІЯ ДЛЯ СТИСНЕННЯ ФОТО З CLOUDINARY
const optimizeImage = (url) => {
  if (!url) return url;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // Додаємо q_auto (якість), f_auto (формат) та w_500 (ширина 500px)
    return url.replace('/upload/', '/upload/q_auto,f_auto,w_500/');
  }
  return url; 
};

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const toast = useToast()

  const stockCount = product.stockCount !== undefined ? product.stockCount : 999;
  const isOutOfStock = product.inStock === false || stockCount === 0;

  const handleBuy = (e) => {
    e.preventDefault() 
    addToCart(product)
    
    toast({
      position: 'top-right',
      duration: 2000,
      render: () => (
        <Box
          color="white"
          p={3}
          bg="#FF0080"
          borderRadius="xl"
          boxShadow="0px 4px 15px rgba(255, 0, 128, 0.5)"
          border="1px solid rgba(255,255,255,0.2)"
          minW="250px"
        >
          <Flex align="center">
            <Box fontSize="24px" mr={3}>🛍️</Box>
            <Box>
              <Text fontWeight="800" fontSize="md">У КОШИКУ!</Text>
              <Text fontSize="sm" opacity="0.9" noOfLines={1}>{product.name}</Text>
            </Box>
          </Flex>
        </Box>
      ),
    })
  }

  const handleNotify = (e) => {
    e.preventDefault()
    
    toast({
      position: "top-right",
      duration: 3000,
      render: () => (
        <Box 
            color="white" 
            p={3} 
            bg="#FF0080" 
            borderRadius="xl" 
            boxShadow="0px 4px 15px rgba(255, 0, 128, 0.5)"
            border="1px solid rgba(255,255,255,0.2)"
        >
           <Flex align="center">
            <Box fontSize="24px" mr={3}>🔔</Box>
            <Box>
               <Text fontWeight="800" fontSize="md">
                 СПОВІЩЕННЯ УВІМКНЕНО!
               </Text>
               <Text fontSize="sm" opacity="0.9">
                 Ми повідомимо вас, коли товар з'явиться.
               </Text>
            </Box>
           </Flex>
        </Box>
      ),
    })
  }

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
    >
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

      <Box h="250px" display="flex" alignItems="center" justifyContent="center" bg="white" overflow="hidden">
        {/* 👇 ОСЬ ТУТ ДОДАНО optimizeImage 👇 */}
        <Image 
          src={optimizeImage(product.image)} 
          alt={product.name} 
          w="full" 
          h="full" 
          objectFit="cover" 
          filter={isOutOfStock ? "grayscale(100%)" : "none"}
          opacity={isOutOfStock ? 0.6 : 1} 
          fallbackSrc="https://placehold.co/400x400?text=No+Image" 
        />
      </Box>

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

          <IconButton 
            icon={isOutOfStock ? <FiBell size={22} /> : <FiShoppingCart size={22} />}
            aria-label={isOutOfStock ? "Повідомити про наявність" : "Купити"}
            variant="outline"
            size="lg"
            h="50px" w="50px"
            border="2px solid black"
            borderRadius="14px"
            color={isOutOfStock ? "gray.500" : "black"}
            borderColor={isOutOfStock ? "gray.400" : "black"}
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