import React from 'react'
import { Box, Container, Heading, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react'

function OfferPage() {
  return (
    <Container maxW="container.md" py={10}>
      <Heading size="xl" mb={6} textTransform="uppercase" textAlign="center">Публічна оферта</Heading>
      <Text color="gray.500" mb={8} textAlign="center">
        Договір публічної оферти є публічним, тобто відповідно до статей 633, 641 Цивільного кодексу України його умови однакові для всіх покупців.
      </Text>

      <Box border="2px solid black" borderRadius="24px" overflow="hidden" bg="white">
        <Accordion allowToggle defaultIndex={[0]}>
          
          <OfferItem title="1. Загальні положення">
            Цей договір є офіційною пропозицією (публічною офертою) Продавця укласти договір купівлі-продажу товарів, розміщених на сайті "Smoke House", дистанційним способом, тобто через Інтернет-магазин.
          </OfferItem>

          <OfferItem title="2. Поняття та визначення">
            "Товар" - перелік найменувань асортименту, представлений в інтернет-магазині.
            "Покупець" - будь-яка дієздатна фізична особа, яка має намір придбати Товар.
          </OfferItem>

          <OfferItem title="3. Оформлення замовлення">
            Замовлення Покупця може бути оформлене через "Кошик" на сайті або по телефону.
            При оформленні замовлення Покупець повинен надати точні дані для доставки.
          </OfferItem>

          <OfferItem title="4. Ціна та оплата">
            Ціни на Товари вказані в національній валюті України. Продавець залишає за собою право змінювати ціну Товару до моменту оформлення замовлення.
          </OfferItem>

          <OfferItem title="5. Права та обов'язки сторін">
            Продавець зобов'язується передати Товар Покупцю відповідно до умов цього Договору.
            Покупець зобов'язується оплатити та прийняти Товар.
            Продавець не несе відповідальності за неналежне використання товарів Покупцем.
          </OfferItem>
          
           <OfferItem title="6. Повернення товару">
            Повернення товару належної якості можливе протягом 14 днів, якщо товар не був у використанні, збережено його товарний вигляд, споживчі властивості, пломби, ярлики.
            Увага! Відповідно до законодавства, певні категорії товарів (наприклад, відкриті рідини, використані картриджі) поверненню не підлягають.
          </OfferItem>

        </Accordion>
      </Box>
    </Container>
  )
}

const OfferItem = ({ title, children }) => (
  <AccordionItem border="none" borderBottom="1px solid #eee">
    <h2>
      <AccordionButton _expanded={{ bg: 'black', color: 'white' }} py={4} _hover={{ bg: 'gray.100' }}>
        <Box flex="1" textAlign="left" fontWeight="bold">
          {title}
        </Box>
        <AccordionIcon />
      </AccordionButton>
    </h2>
    <AccordionPanel pb={4} lineHeight="1.6" color="gray.600">
      {children}
    </AccordionPanel>
  </AccordionItem>
)

export default OfferPage