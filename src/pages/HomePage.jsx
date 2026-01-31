import React, { useState, useEffect } from 'react'
import { 
  Box, Heading, Flex, Container, Grid, Divider, Text, Spinner, Center, 
  Input, InputGroup, InputRightElement, IconButton, List, ListItem, Image 
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'

import ProductCard from '../components/ProductCard'
import HomeCarousel from '../components/HomeCarousel' 
import { fetchProducts } from '../sheets'

// 👇 1. СЛОВНИК СИНОНІМІВ (+ СМАКИ)
const SEARCH_DICTIONARY = [
  // Бренди
  ['elf bar', 'elfbar', 'ельф', 'елф', 'ельфбар', 'ельф бар'],
  ['chaser', 'чейзер', 'чесер', 'чайзер', 'чейз'],
  ['xros', 'іксрос', 'хрос', 'крос', 'xroz'],
  ['voopoo', 'вупу', 'вопу', 'драг', 'drag'],
  ['geekvape', 'гіквейп', 'гік вейп', 'sonder', 'сондер'],
  ['rf350', 'рф350', 'рф', 'rf'],
  
  // Категорії
  ['liquid', 'рідина', 'жижа', 'сольова'],
  ['cartridge', 'картридж', 'катридж', 'іспарік', 'випарник'],

  // 👇 СМАКИ (Тепер знайде Strawberry, якщо ввести Полуниця)
  ['strawberry', 'полуниця', 'клубніка'],
  ['watermelon', 'кавун', 'арбуз'],
  ['melon', 'диня'],
  ['apple', 'яблуко', 'яблоко'],
  ['grape', 'виноград'],
  ['peach', 'персик'],
  ['mint', 'menthol', 'м\'ята', 'мята', 'ментол'],
  ['cola', 'кола'],
  ['banana', 'банан'],
  ['cherry', 'вишня', 'черешня'],
  ['blueberry', 'чорниця', 'черника', 'лохина'],
  ['mango', 'манго'],
  ['kiwi', 'ківі'],
  ['lemon', 'лимон'],
  ['raspberry', 'малина']
];

const getSmartQueries = (input) => {
  const lowerInput = input.toLowerCase().trim();
  let terms = [lowerInput];
  SEARCH_DICTIONARY.forEach(group => {
    if (group.some(word => lowerInput.includes(word))) {
      terms = [...terms, ...group];
    }
  });
  return terms;
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

  // 👇 ОНОВЛЕНИЙ ПОШУК (ШУКАЄ ПО СМАКАХ)
  const handleSearchInput = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 1) {
      const searchTerms = getSmartQueries(query);
      
      const filtered = products.filter(p => {
        const pName = p.name ? p.name.toLowerCase() : '';
        const pBrand = p.brand ? p.brand.toLowerCase() : '';
        const pCategory = p.category ? p.category.toLowerCase() : '';
        
        // 👇 ДОДАЛИ ПОШУК ПО СМАКУ
        const pFlavor = p.flavor ? p.flavor.toLowerCase() : ''; 

        // Шукаємо співпадіння в будь-якому з цих полів
        return searchTerms.some(term => 
            pName.includes(term) || 
            pBrand.includes(term) || 
            pCategory.includes(term) ||
            pFlavor.includes(term) // <--- Тут магія
        );
      }).slice(0, 5)
      
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
                            {/* Якщо є смак, покажемо його в дужках для зручності */}
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

        {/* КАРУСЕЛЬ */}
        <Box position="relative" px={{ base: 0, md: 10 }} zIndex={1}> 
           <HomeCarousel />
        </Box>

      </Container>

      <Container maxW="container.xl">
        <Divider mb={12} borderColor="gray.300" />

        <ProductSection 
          title="АКЦІЙНІ ПРОПОЗИЦІЇ" 
          products={products.filter(p => p.label && p.label.includes('sale'))} 
          icon="🔥" color="red.500" 
          linkTo="/category/sales"
        />
        
        <Divider my={12} />

        <ProductSection 
          title="НОВИНКИ" 
          products={products.filter(p => p.label && p.label.includes('new'))} 
          icon="⚡" color="#FF0080" 
          linkTo="/category/new"
        />

      </Container>
    </Box>
  )
}

const ProductSection = ({ title, products, icon, color, linkTo }) => (
  <Box mb={4}>
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
      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(5, 1fr)" }} gap={4}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Grid>
    ) : (
      <Text color="gray.500">Товарів з міткою "{title === "АКЦІЙНІ ПРОПОЗИЦІЇ" ? "sale" : "new"}" у таблиці не знайдено.</Text>
    )}
  </Box>
)

export default HomePage