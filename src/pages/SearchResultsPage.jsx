import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Box, Container, Heading, SimpleGrid, Text, Center, Spinner, Button, Flex } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { fetchProducts } from '../sheets'
import ProductCard from '../components/ProductCard'

// 🚀 МЕГАСЛОВНИК ВЕЙП-ТЕМАТИКИ
const SEARCH_DICTIONARY = [
  // --- БРЕНДИ (Рідини та Поди) ---
  ['elf bar', 'elfbar', 'ельф', 'елф', 'ельфбар', 'ельф бар', 'elf'],
  ['chaser', 'чейзер', 'чесер', 'чайзер', 'чейз', 'cheizer'],
  ['vaporesso', 'вапоресо', 'вапорессо', 'вапор'],
  ['voopoo', 'вупу', 'вопу', 'вуп'],
  ['geekvape', 'гіквейп', 'гік вейп', 'geek', 'гік'],
  ['oxva', 'оксва', 'охва'],
  ['smok', 'смок'],
  ['joyetech', 'джойтек', 'джой тек'],
  ['saltex', 'салтекс', 'салтекс', 'сольтекс'],
  ['3ger', 'тригер', 'тргер', '3гер'],
  ['fucked', 'факд', 'факед'],
  ['flavorlab', 'флаворлаб', 'флейворлаб', 'flavor lab'],
  ['hype', 'хайп'],
  ['alchemist', 'алхімік', 'алхіміст', 'алхимик'],
  ['black', 'блек', 'блэк'],
  ['octobar', 'октобар', 'окто'],
  
  // --- МОДЕЛІ ПОДІВ ---
  ['xros', 'іксрос', 'хрос', 'крос', 'xroz', 'x-ros'],
  ['drag', 'драг', 'darg'],
  ['ursa', 'урса', 'юрса'],
  ['sonder', 'сондер', 'сандер', 'саундер'],
  ['rf350', 'рф350', 'рф', 'rf', 'rf 350'],
  ['minican', 'мінікан', 'миникан', 'мінік'],
  ['barr', 'барр', 'бар'],
  ['novo', 'ново'],
  ['nord', 'норд'],
  ['jellybox', 'желібокс', 'джелібокс', 'джелі бокс', 'желі'],
  ['aegis', 'агіс', 'аегіс', 'аегис'],
  ['q', 'кью', 'кю'],

  // --- КАТЕГОРІЇ ТА СЛЕНГ ---
  ['liquid', 'рідина', 'жижа', 'сольова', 'сіль', 'salt', 'заправка', 'натуральна', 'органіка'],
  ['cartridge', 'картридж', 'катридж', 'картік', 'картик', 'pod', 'под', 'карт'],
  ['coil', 'койл', 'коіл', 'випарник', 'іспарітель', 'испаритель', 'іспарік', 'іспарик'],
  ['kit', 'набір', 'старт', 'стартовий', 'система', 'под система', 'pod система'],

  // --- СМАКИ: Фрукти та Ягоди ---
  ['apple', 'яблуко', 'яблоко', 'ябл', 'яблучний'],
  ['strawberry', 'полуниця', 'клубника', 'клубніка', 'полун', 'суниця'],
  ['watermelon', 'кавун', 'арбуз', 'арбузний'],
  ['melon', 'диня', 'дыня'],
  ['mango', 'манго'],
  ['cherry', 'вишня', 'вишневий', 'черешня'],
  ['grape', 'виноград', 'грэйп'],
  ['peach', 'персик', 'піч', 'персиковий'],
  ['lemon', 'лимон', 'лемон', 'цитрус'],
  ['blue', 'blueberry', 'чорниця', 'черника', 'лохина'],
  ['raspberry', 'малина', 'малина', 'малиновий'],
  ['blackberry', 'ожина', 'ежевика'],
  ['banana', 'банан', 'банановий'],
  ['pineapple', 'ананас', 'ананасовий'],
  ['orange', 'апельсин', 'оранж', 'мандарин'],
  ['kiwi', 'ківі', 'киви'],
  ['pomegranate', 'гранат', 'гранатовий'],
  ['berry', 'ягоди', 'ягідний', 'лесные ягоды', 'berries', 'лісові'],
  ['mixed', 'мікс', 'микс', 'мульти', 'фруктовий'],

  // --- СМАКИ: Напої, Десерти та Інше ---
  ['mint', 'м\'ята', 'мята', 'ментол', 'menthol', 'мятний'],
  ['ice', 'лід', 'холодок', 'айс', 'з льодом', 'холодний', 'холодна', 'ice'],
  ['tobacco', 'тютюн', 'табак', 'тобак', 'сигаретний'],
  ['cola', 'кола', 'кола', 'coca'],
  ['energy', 'енергетик', 'энергетик', 'редбул', 'redbull', 'red bull', 'енерджі'],
  ['gum', 'жуйка', 'жвачка', 'bubble', 'бабл', 'bubblegum'],
  ['candy', 'цукерка', 'конфета', 'льодяник', 'мармелад', 'скітлс', 'skittles'],
  ['cake', 'пиріг', 'пирог', 'торт', 'десерт', 'випічка'],
  ['donut', 'пончик', 'донат'],
  ['cream', 'крем', 'вершки', 'сливки', 'морозиво', 'пломбір'],
  ['coffee', 'кава', 'кофе', 'капучіно'],
  ['tea', 'чай'],
  ['sour', 'кислий', 'кисла', 'саур', 'кислинка'],
  ['sweet', 'солодкий', 'солодка', 'світ']
];

// РОЗУМНА ФУНКЦІЯ РОЗБИТТЯ ЗАПИТУ НА ГРУПИ СИНОНІМІВ
const getSmartQueryGroups = (input) => {
  // Розбиваємо запит на окремі слова (наприклад: "chaser яблуко" -> ['chaser', 'яблуко'])
  const words = input.toLowerCase().trim().split(/\s+/);
  
  return words.map(word => {
    let synonyms = [word];
    // Шукаємо, до якої групи синонімів належить кожне слово
    SEARCH_DICTIONARY.forEach(group => {
      // Якщо хоч одне слово з групи схоже на те, що ввів юзер (або навпаки)
      if (group.some(gWord => word.includes(gWord) || gWord.includes(word))) {
        synonyms = [...new Set([...synonyms, ...group])];
      }
    });
    return synonyms; // Повертає масив можливих значень для ОДНОГО слова
  });
}

function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || '' 
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query) {
        setProducts([])
        setLoading(false)
        return;
    }

    setLoading(true)
    fetchProducts().then((data) => {
      // Отримуємо групи синонімів для кожного введеного слова
      const queryGroups = getSmartQueryGroups(query);

      const filtered = data.filter(p => {
        // Створюємо єдиний мега-рядок з усієї інформації про товар (ДОДАНО FLAVOR!)
        const searchString = [
            p.name || '',
            p.brand || '',
            p.category || '',
            p.flavor || '',       // Сюди підтягується смак з таблиці
            p.tasteGroup || ''    // Якщо є група смаків
        ].join(' ').toLowerCase();

        // МАГІЯ ТУТ:
        // Перевіряємо, чи КОЖНЕ слово, яке ввів юзер (через свої синоніми),
        // присутнє в рядку характеристик товару.
        return queryGroups.every(synonymGroup => 
            synonymGroup.some(synonym => searchString.includes(synonym))
        );
      })
      setProducts(filtered)
      setLoading(false)
    })
  }, [query])

  if (loading) return <Center h="60vh"><Spinner size="xl" thickness="4px" color="#FF0080" /></Center>

  return (
    <Container maxW="container.xl" py={8}>
      <Flex align="center" mb={6} justify="space-between" wrap="wrap" gap={4}>
         <Heading textTransform="uppercase" size="lg">
           Результати за запитом: <Text as="span" color="#FF0080">"{query}"</Text>
         </Heading>
         <Text fontWeight="bold" color="gray.500">Знайдено: {products.length}</Text>
      </Flex>

      {products.length === 0 ? (
        <Center flexDir="column" py={16} border="2px dashed #eee" borderRadius="24px">
          <Text fontSize="6xl" mb={4}>🤔</Text>
          <Heading size="md" textTransform="uppercase" mb={2}>Нічого не знайдено</Heading>
          <Text color="gray.500" mb={6} textAlign="center" maxW="400px">
            Спробуйте використати інші ключові слова, наприклад "elf bar" замість "ельф", або перевірте правильність написання.
          </Text>
          <Button as={Link} to="/" leftIcon={<ArrowBackIcon />} size="lg" variant="outline" border="2px solid black" borderRadius="14px" _hover={{ bg: "black", color: "white" }}>
             В КАТАЛОГ
          </Button>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={{ base: 4, md: 6 }}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  )
}

export default SearchResultsPage