import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Box, Container, Heading, SimpleGrid, Text, Center, Spinner, Button } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { fetchProducts } from '../sheets'
import ProductCard from '../components/ProductCard'

// Словник (дублюємо, щоб працювало автономно)
const SEARCH_DICTIONARY = [
  ['elf bar', 'elfbar', 'ельф', 'елф', 'ельфбар', 'ельф бар'],
  ['chaser', 'чейзер', 'чесер', 'чайзер', 'чейз'],
  ['xros', 'іксрос', 'хрос', 'крос', 'xroz'],
  ['voopoo', 'вупу', 'вопу', 'драг', 'drag'],
  ['geekvape', 'гіквейп', 'гік вейп', 'sonder', 'сондер'],
  ['rf350', 'рф350', 'рф', 'rf'],
  ['liquid', 'рідина', 'жижа', 'сольова'],
  ['cartridge', 'картридж', 'катридж', 'іспарік', 'випарник']
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

function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || '' 
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchProducts().then((data) => {
      // 👇 РОЗУМНИЙ ФІЛЬТР
      const searchTerms = getSmartQueries(query);

      const filtered = data.filter(p => {
        const pName = p.name.toLowerCase();
        const pBrand = p.brand?.toLowerCase() || '';
        const pCategory = p.category?.toLowerCase() || '';
        
        // Шукаємо по всіх синонімах
        return searchTerms.some(term => 
          pName.includes(term) || 
          pBrand.includes(term) ||
          pCategory.includes(term)
        );
      })
      setProducts(filtered)
      setLoading(false)
    })
  }, [query])

  if (loading) return <Center h="60vh"><Spinner size="xl" thickness="4px" /></Center>

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6} textTransform="uppercase" size="lg">
        Результати пошуку: "{query}"
      </Heading>

      {products.length === 0 ? (
        <Center flexDir="column" py={10}>
          <Text fontSize="2xl" mb={4}>🤔 Нічого не знайдено</Text>
          <Text color="gray.500" mb={6}>Спробуйте змінити запит (наприклад, "elf bar" замість "ельф").</Text>
          <Button as={Link} to="/" leftIcon={<ArrowBackIcon />}>На головну</Button>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  )
}

export default SearchResultsPage