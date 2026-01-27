import React from 'react'
import { Box, Container, Heading, Text, SimpleGrid, VStack, HStack, Icon, Divider, List, ListItem, ListIcon } from '@chakra-ui/react'
import { FaTruck, FaCreditCard, FaBoxOpen, FaClock, FaCheckCircle } from 'react-icons/fa'

function DeliveryPage() {
  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={4} mb={10} textAlign="center">
        <Heading size="2xl" textTransform="uppercase">Доставка та Оплата</Heading>
        <Text fontSize="xl" color="gray.500">Як отримати та оплатити замовлення</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
        
        {/* БЛОК ДОСТАВКИ */}
        <Box border="2px solid black" borderRadius="24px" p={8} bg="white" position="relative" overflow="hidden">
           <Box position="absolute" top="-20px" right="-20px" opacity={0.05}>
              <Icon as={FaTruck} boxSize="150px" />
           </Box>
           
           <HStack mb={6} spacing={4}>
              <Box bg="#FF0080" p={3} borderRadius="16px" color="white">
                <Icon as={FaBoxOpen} boxSize="30px" />
              </Box>
              <Heading size="lg">Доставка</Heading>
           </HStack>

           <VStack align="start" spacing={4}>
              <Text fontWeight="bold" fontSize="lg">Ми відправляємо Новою Поштою по всій Україні.</Text>
              
              <List spacing={3}>
                <ListItem display="flex" alignItems="center">
                    <ListIcon as={FaCheckCircle} color="#FF0080" />
                    Відправка в день замовлення (якщо оформлено до 16:00).
                </ListItem>
                <ListItem display="flex" alignItems="center">
                    <ListIcon as={FaCheckCircle} color="#FF0080" />
                    Доставка займає 1-2 дні.
                </ListItem>
                
              </List>

              <Divider borderColor="black" my={2} />
              
              <HStack color="gray.500">
                  <Icon as={FaClock} />
                  <Text fontSize="sm">Працюємо без вихідних: 10:00 - 20:00</Text>
              </HStack>
           </VStack>
        </Box>

        {/* БЛОК ОПЛАТИ */}
        <Box border="2px solid black" borderRadius="24px" p={8} bg="black" color="white" position="relative" overflow="hidden">
           <Box position="absolute" top="-20px" right="-20px" opacity={0.1}>
              <Icon as={FaCreditCard} boxSize="150px" />
           </Box>

           <HStack mb={6} spacing={4}>
              <Box bg="white" p={3} borderRadius="16px" color="black">
                <Icon as={FaCreditCard} boxSize="30px" />
              </Box>
              <Heading size="lg">Оплата</Heading>
           </HStack>

           <VStack align="start" spacing={6}>
              <Box>
                  <Text fontWeight="bold" fontSize="lg" color="#FF0080" mb={1}>1. Накладений платіж</Text>
                  <Text color="gray.400" fontSize="sm">Оплата при отриманні на пошті. Ви можете оглянути товар перед оплатою. Комісія Нової Пошти: 20 грн + 2% від суми.</Text>
              </Box>

              <Box>
                  <Text fontWeight="bold" fontSize="lg" color="#FF0080" mb={1}>2. Оплата на картку (Monobank/Privat)</Text>
                  <Text color="gray.400" fontSize="sm">Реквізити надійшле менеджер після підтвердження замовлення. Економте на комісії пошти.</Text>
              </Box>

              <Box>
                  <Text fontWeight="bold" fontSize="lg" color="#FF0080" mb={1}>3. Готівкою</Text>
                  <Text color="gray.400" fontSize="sm">При самовивозі з наших магазинів (Калинівка, Вишневе).</Text>
              </Box>
           </VStack>
        </Box>

      </SimpleGrid>
    </Container>
  )
}

export default DeliveryPage