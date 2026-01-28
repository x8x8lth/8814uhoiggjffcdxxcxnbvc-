import React, { useState } from 'react'
import { 
  Box, Container, SimpleGrid, Stack, Text, Link, Image, IconButton, 
  Input, Button, InputGroup, InputRightElement, Divider, Flex, Icon, useToast 
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaTelegram, FaInstagram, FaTiktok, FaArrowRight } from 'react-icons/fa'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

const PINK_COLOR = "#FF0080"
const PINK_HOVER = "#D6006B"

function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      toast({ title: "Введіть коректний Email", status: "warning", position: "bottom-right" })
      return
    }

    setLoading(true)

    // 👇 БЕРЕМО ДАНІ З .env
    const TELEGRAM_TOKEN = import.meta.env.VITE_TELEGRAM_TOKEN;
    const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    const text = `🚀 *НОВИЙ ПІДПИСНИК!*\n\n📧 Email: \`${email}\``

    try {
      if (TELEGRAM_TOKEN && CHAT_ID) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: text, parse_mode: 'Markdown' })
          });
      } else {
          console.log("Токен не налаштовано, імітуємо успіх");
      }

      toast({ 
        title: "Ви успішно підписались! 🚀", 
        description: "Чекайте на круті новини.", 
        status: "success", 
        duration: 3000, 
        isClosable: true,
        position: "bottom-right"
      })
      setEmail('') 

    } catch (error) {
      console.error(error)
      toast({ title: "Помилка", status: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box bg="black" color="white" mt="auto">
      {/* Верхня частина: Розсилка */}
      <Box borderBottom="1px solid #333">
        <Container maxW="container.xl" py={10}>
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={6}>
            <Box>
              <Text fontSize="2xl" fontWeight="900" textTransform="uppercase" mb={2}>
                Будь в курсі двіжу 🚀
              </Text>
              <Text color="gray.400">Отримуй інфу про новинки та закриті розпродажі.</Text>
            </Box>
            
            <InputGroup size="lg" maxW="400px">
              <Input 
                placeholder="Твій email" 
                bg="#1a1a1a" 
                border="none" 
                borderRadius="16px" 
                color="white"
                _focus={{ boxShadow: `0px 0px 0px 2px ${PINK_COLOR}` }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              />
              <InputRightElement w="60px">
                <IconButton 
                  h="full" w="full" 
                  bg={PINK_COLOR} 
                  color="white" 
                  borderTopRightRadius="16px" 
                  borderBottomRightRadius="16px" 
                  _hover={{ bg: PINK_HOVER }} 
                  icon={<FaArrowRight />} 
                  aria-label="Subscribe"
                  isLoading={loading}
                  onClick={handleSubscribe}
                />
              </InputRightElement>
            </InputGroup>
          </Flex>
        </Container>
      </Box>

      {/* Основна частина */}
      <Container maxW="container.xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={10}>
          
          {/* 1. БРЕНД */}
          <Stack spacing={6}>
            <Box>
              <Image 
                src="https://i.ibb.co/pvm42BVB/image-2026-01-13-13-02-52-1.png" 
                alt="Smoke House" 
                h="60px" 
                objectFit="contain" 
              />
            </Box>
            <Text color="gray.400" fontSize="sm">
              Твій провідник у світ густої пари. Тільки оригінальна продукція, швидка доставка та чесні ціни.
            </Text>
            <Stack direction="row" spacing={4}>
              <SocialBtn icon={<FaTelegram />} href="https://t.me/Manager_Smoke1" />
              <SocialBtn icon={<FaInstagram />} href="https://www.instagram.com/smoke_house.vyshneve/" />
              <SocialBtn icon={<FaTiktok />} href="https://www.tiktok.com/@housee.shop" />
            </Stack>
          </Stack>

          {/* 2. КАТАЛОГ */}
          <Stack align={{ base: "flex-start", md: "flex-start" }}>
            <Text fontWeight="bold" fontSize="lg" mb={2} color={PINK_COLOR}>КАТАЛОГ</Text>
            <FooterLink to="/category/sales">Акції</FooterLink>
            <FooterLink to="/category/new">Новинки</FooterLink>
            <FooterLink to="/category/liquids">Рідини</FooterLink>
            <FooterLink to="/category/pods">Pod-системи</FooterLink>
            <FooterLink to="/category/parts">Комплектуючі</FooterLink>
          </Stack>

          {/* 3. КЛІЄНТАМ */}
          <Stack align={{ base: "flex-start", md: "flex-start" }}>
            <Text fontWeight="bold" fontSize="lg" mb={2} color={PINK_COLOR}>ІНФО</Text>
            <FooterLink to="/about">Про нас</FooterLink>
            <FooterLink to="/delivery">Доставка та оплата</FooterLink>
            <FooterLink to="/offer">Публічна оферта</FooterLink>
            <FooterLink to="/contacts">Контакти</FooterLink>
          </Stack>

          {/* 4. КОНТАКТИ */}
          <Stack spacing={4}>
            <Text fontWeight="bold" fontSize="lg" mb={2} color={PINK_COLOR}>КОНТАКТИ</Text>
            
            <Flex align="center" gap={3}>
              <Icon as={FiPhone} color="gray.400" />
              <Link href="tel:+380973043637" _hover={{ color: PINK_COLOR }} fontWeight="bold">
                +380 97 304 36 37
              </Link>
            </Flex>
            
            <Flex align="center" gap={3}>
              <Icon as={FiMail} color="gray.400" />
              <Link href="mailto:smokehouse01x@gmail.com" _hover={{ color: PINK_COLOR }}>
                smokehouse01x@gmail.com
              </Link>
            </Flex>

            {/* Магазин 1 */}
            <Flex align="start" gap={3}>
              <Icon as={FiMapPin} color="#FF0080" mt={1} />
              <Text color="gray.400">
                смт. Калинівка,<br /> Центральна вулиця, 33
              </Text>
            </Flex>

            {/* Магазин 2 */}
            <Flex align="start" gap={3}>
              <Icon as={FiMapPin} color="#FF0080" mt={1} />
              <Text color="gray.400">
                м. Вишневе,<br /> вул. Лесі Українки, 66
              </Text>
            </Flex>
          </Stack>

        </SimpleGrid>

        <Divider my={10} borderColor="#333" />

        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" color="gray.500" fontSize="sm">
          <Text>© {new Date().getFullYear()} Smoke House. Всі права захищені.</Text>
          <Flex align="center" gap={2} mt={{ base: 2, md: 0 }}>
             <Box w="30px" h="30px" bg="gray.800" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" color="white" fontWeight="bold">18+</Box>
             <Text>Продукція викликає залежність.</Text>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

const FooterLink = ({ to, children }) => (
  <Link 
    as={RouterLink} 
    to={to} 
    color="gray.400" 
    _hover={{ color: PINK_COLOR, transform: "translateX(5px)" }} 
    transition="all 0.2s"
    display="inline-block"
  >
    {children}
  </Link>
)

const SocialBtn = ({ icon, href }) => (
  <IconButton 
    as="a" 
    href={href} 
    target="_blank"
    icon={icon} 
    isRound 
    bg="#1a1a1a" 
    color="white" 
    _hover={{ bg: PINK_COLOR, transform: "translateY(-3px)" }} 
    size="lg"
    aria-label="Social"
  />
)

export default Footer