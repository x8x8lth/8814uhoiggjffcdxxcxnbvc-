import React from 'react'
import { Box, Container, Heading, Text, Grid, GridItem, Image, VStack, Divider, Flex } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'

function AboutPage() {
  return (
    <Box bg="white" minH="100vh" pb={20}>
      
      {/* === 1. ВІДЕО БАНЕР (На весь екран) === */}
      <Box position="relative" w="full" h={{ base: "60vh", md: "80vh" }} overflow="hidden" borderBottom="3px solid black">
        {/* Відео */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover', // Розтягує відео без спотворень
            zIndex: 0
          }}
        >
          {/* Посилання на атмосферне відео (дим/вейп) */}
          <source src="/video.mp4" type="video/mp4" />
        </video>

        {/* Затемнення поверх відео */}
        <Box position="absolute" top="0" left="0" w="full" h="full" bg="blackAlpha.600" zIndex={1} />

       
      </Box>

      {/* === 2. ТЕКСТОВА ЧАСТИНА === */}
      <Container maxW="container.xl" mt={16}>
        
        {/* Блок: Хто ми */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={10} alignItems="center">
          <GridItem>
            <Heading size="2xl" mb={6} textTransform="uppercase">Хто ми?</Heading>
            <Text fontSize="lg" lineHeight="1.8" color="gray.600" mb={4}>
              <Box as="span" fontWeight="bold" color="black">SMOKE HOUSE</Box> - це не просто магазин, це місце сили для тих, хто цінує якість, смак та стиль. Ми почали свій шлях у 2023 році з простої ідеї: зібрати найкращі девайси та рідини в одному місці, без компромісів.
            </Text>
            <Text fontSize="lg" lineHeight="1.8" color="gray.600">
              Ми втомилися від "китайського ширпотребу" та нудних смаків. Тому кожен картридж, кожен под та кожна баночка рідини, яка потрапляє на наші полиці, проходить жорсткий відбір. Ми продаємо тільки те, що парили б самі.
            </Text>
          </GridItem>
          
          <GridItem>
            {/* Прибрав p={2} щоб рамка була впритул до фото, і прибрав фільтр */}
            <Box border="3px solid black" boxShadow="8px 8px 0px black" overflow="hidden">
              <Image 
                src="https://i.ibb.co/mC7BSJWf/5456515023837532517.jpg" 
                alt="Vape Shop Interior" 
                w="full" h="400px" objectFit="cover" 
                // filter="grayscale(100%)"  <-- Цей рядок видалено!
              />
            </Box>
          </GridItem>
        </Grid>

        <Divider my={16} borderColor="black" borderBottomWidth="3px" opacity={1} />

        {/* Блок: Наші принципи */}
        <Heading size="xl" textAlign="center" mb={10} textTransform="uppercase">Наші принципи</Heading>
        
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
          <FeatureCard 
            title="Тільки Оригінал" 
            text="Жодних підробок. Ми працюємо напряму з виробниками Elf Bar, Chaser, Vaporesso. Ти отримуєш гарантовану якість." 
          />
          <FeatureCard 
            title="Швидкість" 
            text="Відправка в день замовлення. Ми знаємо, як важко чекати на улюблену жижу, тому пакуємо та відправляємо миттєво." 
          />
          <FeatureCard 
            title="Клієнт — Бро" 
            text="Ми не 'впарюємо'. Ми радимо. Якщо тобі щось не підійде - ми скажемо про це чесно. Нам важлива довіра, а не чек." 
          />
        </Grid>

        <Divider my={16} borderColor="black" borderBottomWidth="3px" opacity={1} />

        {/* Блок: Заклик */}
        <Box bg="black" color="white" p={10} textAlign="center" border="3px solid black">
          <Heading size="lg" mb={4} textTransform="uppercase">Готовий приєднатися?</Heading>
          <Text fontSize="xl" mb={8} color="gray.400">Обирай свій перший девайс або поповнюй запаси прямо зараз</Text>
          <Box 
            as="a" 
            href="/category/sales" 
            display="inline-block"
            bg="#FF0080" // Рожева кнопка
            color="white" 
            px={8} py={4} 
            fontWeight="bold" 
            fontSize="lg"
            border="2px solid white"
            _hover={{ bg: "#D6006B", transform: "translateY(-2px)", boxShadow: "0px 0px 15px #FF0080" }}
          >
            ПЕРЕЙТИ ДО КАТАЛОГУ
          </Box>
        </Box>

      </Container>
    </Box>
  )
}

// Компонент картки з принципами (щоб не дублювати код)
const FeatureCard = ({ title, text }) => (
  <VStack 
    align="start" 
    p={6} 
    border="3px solid black" 
    transition="all 0.3s"
    _hover={{ transform: "translateY(-5px)", boxShadow: "8px 8px 0px #2cbf5a" }} // Зелена тінь при наведенні
  >
    <CheckCircleIcon w={8} h={8} color="#2cbf5a" mb={2} />
    <Heading size="md" mb={2} textTransform="uppercase">{title}</Heading>
    <Text color="gray.600">{text}</Text>
  </VStack>
)

export default AboutPage