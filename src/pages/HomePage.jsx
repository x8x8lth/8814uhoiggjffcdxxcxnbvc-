import React, { useState, useEffect } from 'react'
import { 
  Box, Heading, Flex, Container, Divider, Text, Spinner, Center, 
  Input, InputGroup, InputRightElement, IconButton, List, ListItem, Image,
  useBreakpointValue
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

import ProductCard from '../components/ProductCard'
import HomeCarousel from '../components/HomeCarousel' 
import { fetchProducts } from '../sheets'

// 🚀 МЕГАСЛОВНИК ВЕЙП-ТЕМАТИКИ (синхронізований з SearchResultsPage)
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
  const words = input.toLowerCase().trim().split(/\s+/);
  return words.map(word => {
    let synonyms = [word];
    SEARCH_DICTIONARY.forEach(group => {
      if (group.some(gWord => word.includes(gWord) || gWord.includes(word))) {
        synonyms = [...new Set([...synonyms, ...group])];
      }
    });
    return synonyms; 
  });
}

function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts().then(data => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  const handleSearchInput = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim().length > 1) {
      // 👇 ОНОВЛЕНИЙ АЛГОРИТМ ПОШУКУ
      const queryGroups = getSmartQueryGroups(query);
      
      const filtered = products.filter(p => {
        const searchString = [
            p.name || '',
            p.brand || '',
            p.category || '',
            p.flavor || '',       
            p.tasteGroup || ''    
        ].join(' ').toLowerCase();

        return queryGroups.every(synonymGroup => 
            synonymGroup.some(synonym => searchString.includes(synonym))
        );
      }).slice(0, 5) // Залишаємо обмеження в 5 товарів для випадашки
      
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`)
      setSearchResults([])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchSubmit()
  }

  const handleResultClick = (id) => {
    navigate(`/product/${id}`)
  }

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" thickness='4px' speed='0.65s' color='black' />
      </Center>
    )
  }

  return (
    <Box bg="#f8f9fa" pb={10}>
      
      <Container maxW="container.xl" pt={2} pb={2}>
        
        {/* ПОШУК */}
        <Box w="full" maxW="900px" mx="auto" mb={2} px={{ base: 0, md: 4 }} position="relative" zIndex={10}>
          <InputGroup size="lg">
            <Input 
              placeholder="Я шукаю... (напр. Полуниця, Elf Bar)" 
              bg="white" 
              border="2px solid black" 
              borderRadius="16px"
              _focus={{ boxShadow: "0 0 0 2px #FF0080", borderColor: "#FF0080" }}
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyDown={handleKeyDown}
            />
            <InputRightElement width="60px">
              <IconButton 
                h="100%" w="100%"
                bg="black" 
                color="white" 
                borderRightRadius="14px"
                icon={<FiSearch size={24} />} 
                _hover={{ bg: "#FF0080" }}
                onClick={handleSearchSubmit}
              />
            </InputRightElement>
          </InputGroup>

          {/* ВИПАДАЮЧИЙ СПИСОК */}
          {searchResults.length > 0 && (
            <Box 
              position="absolute" top="55px" left={{ base: 0, md: 4 }} right={{ base: 0, md: 4 }}
              bg="white" color="black" borderRadius="16px" 
              boxShadow="xl" border="2px solid black" overflow="hidden"
            >
              <List spacing={0}>
                {searchResults.map(product => (
                  <ListItem 
                    key={product.id} 
                    p={3} borderBottom="1px solid #eee" 
                    _hover={{ bg: "gray.50", cursor: "pointer" }}
                    onClick={() => handleResultClick(product.id)}
                  >
                    <Flex align="center">
                      <Image 
                        src={product.image} 
                        boxSize="40px" 
                        objectFit="contain" 
                        mr={3} 
                        borderRadius="md" 
                        fallbackSrc="https://placehold.co/40" 
                      />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                            {product.name}
                            {product.flavor && <Text as="span" color="gray.500" fontWeight="normal"> ({product.flavor})</Text>}
                        </Text>
                        <Text fontSize="xs" color="gray.500">{product.price} ₴</Text>
                      </Box>
                    </Flex>
                  </ListItem>
                ))}
                <ListItem 
                    p={2} bg="gray.100" textAlign="center" cursor="pointer" 
                    onClick={handleSearchSubmit}
                    _hover={{ bg: "gray.200" }}
                >
                    <Text fontSize="xs" fontWeight="bold" color="#FF0080">
                        Переглянути всі результати
                    </Text>
                </ListItem>
              </List>
            </Box>
          )}
        </Box>

        {/* ГОЛОВНИЙ БАНЕР-КАРУСЕЛЬ */}
        <Box position="relative" px={{ base: 0, md: 10 }} zIndex={1}> 
           <HomeCarousel />
        </Box>

      </Container>

      {/* СЕКЦІЇ ТОВАРІВ (КАРУСЕЛІ) */}
      <Container maxW="container.xl" overflow="visible">
        <Divider mb={12} borderColor="gray.300" />

        <ProductCarouselSection 
          title="АКЦІЙНІ ПРОПОЗИЦІЇ" 
          products={products.filter(p => p.label && p.label.includes('sale'))} 
          icon="🔥" color="#FF0080"
          linkTo="/category/sales"
        />
        
        <Divider my={12} />

        <ProductCarouselSection 
          title="НОВИНКИ" 
          products={products.filter(p => p.label && p.label.includes('new'))} 
          icon="⚡" color="#FF0080" 
          linkTo="/category/new"
        />

      </Container>
    </Box>
  )
}

// 👇 КОМПОНЕНТ КАРУСЕЛІ
const ProductCarouselSection = ({ title, products, icon, color, linkTo }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // 👇 ЗМІНА: base: 2 (2 картки на телефоні)
    const cardsVisible = useBreakpointValue({ base: 2, sm: 2, md: 3, lg: 4, xl: 5 }) || 2;
    
    const totalProducts = products.length;

    const nextSlide = () => {
        if (currentIndex < totalProducts - cardsVisible) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCurrentIndex(0); 
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            setCurrentIndex(totalProducts - cardsVisible > 0 ? totalProducts - cardsVisible : 0);
        }
    };

    return (
        <Box mb={4} position="relative">
            {/* ЗАГОЛОВОК */}
            <Flex justify="space-between" align="center" mb={6} pb={2} borderBottom="3px solid black">
                <Flex align="center" gap={2}>
                    <Text fontSize="2xl">{icon}</Text>
                    <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" textTransform="uppercase" color="black">
                        {title}
                    </Heading>
                </Flex>
                <Link to={linkTo || "/category/liquids"}> 
                    <Box as="span" color="black" fontWeight="bold" fontSize="sm" borderBottom="2px solid" borderColor={color} _hover={{ bg: color, color: "white", px: 2 }} transition="all 0.2s">
                        КАТАЛОГ →
                    </Box>
                </Link>
            </Flex>
            
            {products.length > 0 ? (
                <Box position="relative">
                    
                    {/* КНОПКА ВЛІВО */}
                    {totalProducts > cardsVisible && (
                        <IconButton 
                            icon={<FiChevronLeft size={24} />}
                            position="absolute"
                            left={{ base: "-10px", xl: "-50px" }}
                            top="50%"
                            transform="translateY(-50%)"
                            zIndex={2}
                            isRound
                            bg="white"
                            border="2px solid black"
                            boxShadow="lg"
                            onClick={prevSlide}
                            _hover={{ bg: "black", color: "white" }}
                            aria-label="Назад"
                        />
                    )}

                    {/* ВІКНО КАРУСЕЛІ */}
                    <Box overflow="hidden" py={4} mx={{ base: 0, xl: -2 }}>
                        <Flex 
                            transition="transform 0.5s ease-in-out"
                            transform={`translateX(-${currentIndex * (100 / cardsVisible)}%)`}
                            gap={0} 
                        >
                            {products.map((product) => (
                                <Box 
                                    key={product.id} 
                                    minW={`${100 / cardsVisible}%`} 
                                    px={2} 
                                >
                                    <ProductCard product={product} />
                                </Box>
                            ))}
                        </Flex>
                    </Box>

                    {/* КНОПКА ВПРАВО */}
                    {totalProducts > cardsVisible && (
                        <IconButton 
                            icon={<FiChevronRight size={24} />}
                            position="absolute"
                            right={{ base: "-10px", xl: "-50px" }}
                            top="50%"
                            transform="translateY(-50%)"
                            zIndex={2}
                            isRound
                            bg="white"
                            border="2px solid black"
                            boxShadow="lg"
                            onClick={nextSlide}
                            _hover={{ bg: "black", color: "white" }}
                            aria-label="Вперед"
                        />
                    )}

                </Box>
            ) : (
                <Text color="gray.500">Товарів з міткою "{title === "АКЦІЙНІ ПРОПОЗИЦІЇ" ? "sale" : "new"}" не знайдено.</Text>
            )}
        </Box>
    )
}

export default HomePage