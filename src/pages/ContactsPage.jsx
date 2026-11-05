import React from 'react'
import { Box, Container, Heading, Text, SimpleGrid, VStack, HStack, Icon, Button, Divider } from '@chakra-ui/react'
import { FaTelegram, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaClock, FaStore } from 'react-icons/fa'

function ContactsPage() {
  return (
    <Container maxW="container.xl" py={10}>
      
      {/* ЗАГОЛОВОК */}
      <VStack spacing={2} mb={10} textAlign="center">
        <Heading size="2xl" textTransform="uppercase">Контакти</Heading>
        <Text fontSize="xl" color="gray.500">Ми завжди на зв'язку 👋</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={16}>
        
        {/* ЛІВА КОЛОНКА */}
        <VStack spacing={6} align="stretch">
          <ContactCard 
            icon={FaPhoneAlt} 
            title="Телефон" 
            text="+380973043637" 
            subText="Консультації по замовленнях"
            action={<Button as="a" href="tel:380973043637" size="sm" variant="outline" borderRadius="12px">Подзвонити</Button>}
          />

          <Box 
            bg="black" color="white" p={6} borderRadius="24px" 
            border="2px solid black" position="relative" overflow="hidden"
            transition="transform 0.2s" _hover={{ transform: "translateY(-4px)" }}
          >
            <HStack justify="space-between" align="start" mb={4}>
              <VStack align="start" spacing={1}>
                <Heading size="md">Telegram</Heading>
                <Text fontSize="sm" opacity={0.8}>Найшвидша відповідь тут</Text>
              </VStack>
              <Icon as={FaTelegram} boxSize={8} color="#2AABEE" />
            </HStack>
            <Button 
              as="a" href="https://t.me/Manager_Smoke1" target="_blank"
              w="full" bg="white" color="black" borderRadius="12px" fontWeight="bold"
              _hover={{ bg: "#2AABEE", color: "white" }}
            >
              Написати менеджеру
            </Button>
          </Box>
        </VStack>

        {/* ПРАВА КОЛОНКА */}
        <VStack spacing={6} align="stretch">
          
          {/* 👇 ТУТ ТЕПЕР ДВІ КНОПКИ ІНСТАГРАМ */}
          <ContactCard 
            icon={FaInstagram} 
            title="Наш Instagram"  
            
            action={
              <VStack w="full" spacing={2} mt={2}>
                 <Button 
                    as="a" href="https://www.instagram.com/smokehousevape.com.ua/" target="_blank"
                    size="sm" w="full" colorScheme="pink" variant="solid" borderRadius="12px"
                    leftIcon={<Icon as={FaInstagram} />}
                  >
                
                  </Button>
                  
              </VStack>
            }
          />

           <ContactCard 
            icon={FaClock} 
            title="Прийом онлайн замовлень" 
            text="Пн-Нд: 10:00 - 20:00" 
            subText="Відправки кожного дня о 16:00"
          />
        </VStack>
      </SimpleGrid>

      <Divider borderColor="black" mb={10} />

      {/* НИЖНЯ СЕКЦІЯ: МАГАЗИНИ (Без кнопок, тільки адреса) */}
      <Box>
        <Heading size="lg" mb={8} textAlign="center" textTransform="uppercase">
             <Icon as={FaStore} mr={3} mb={1} color="#FF0080" />
             Наші Магазини
        </Heading>


      </Box>

      

    </Container>
  )
}

const ContactCard = ({ icon, title, text, subText, action }) => (
  <Box 
    p={6} borderRadius="24px" border="2px solid #eee" bg="white"
    transition="all 0.2s" _hover={{ borderColor: "black", boxShadow: "lg" }}
  >
    <HStack spacing={4} align="start">
      <Box p={3} bg="gray.50" borderRadius="12px">
        <Icon as={icon} boxSize={5} />
      </Box>
      <VStack align="start" spacing={1} flex={1}>
        <Text fontWeight="bold" fontSize="lg">{title}</Text>
        <Text fontSize="md" fontWeight="bold">{text}</Text>
        {subText && <Text fontSize="xs" color="gray.500">{subText}</Text>}
      </VStack>
    </HStack>
    {/* Action винесено вниз для кращого вигляду кнопок */}
    {action && <Box mt={4}>{action}</Box>}
  </Box>
)

const StoreBlock = ({ city, address, schedule, mapLink }) => (
    <Box 
        border="2px solid black" borderRadius="24px" p={6} bg="white"
        transition="transform 0.2s" _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
    >
        <VStack align="start" spacing={4}>
            <HStack align="start" spacing={4}>
                <Box p={3} bg="#FF0080" borderRadius="12px" color="white">
                    <Icon as={FaMapMarkerAlt} boxSize={6} />
                </Box>
                <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase">{city}</Text>
                    <Heading size="md" mb={1}>{address}</Heading>
                    <Text fontSize="xs" as="a" href={mapLink} target="_blank" color="blue.500" textDecoration="underline">
                        Показати на карті
                    </Text>
                </Box>
            </HStack>
            <Divider borderColor="gray.200" />
            <HStack spacing={4}>
                <Icon as={FaClock} color="gray.400" boxSize={5} ml={3} />
                <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">ГРАФІК РОБОТИ:</Text>
                    <Text fontWeight="bold" fontSize="lg">{schedule}</Text>
                </VStack>
            </HStack>
        </VStack>
    </Box>
)

export default ContactsPage