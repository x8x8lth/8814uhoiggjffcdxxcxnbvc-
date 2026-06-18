import React, { useState, useEffect } from 'react'
import { 
  Box, Heading, Flex, Container, Divider, Text, Spinner, Center, 
  Input, InputGroup, InputRightElement, IconButton, List, ListItem, Image,
  useBreakpointValue, VStack, Button,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Textarea, useDisclosure, useToast, HStack
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

import ProductCard from '../components/ProductCard'
import HomeCarousel from '../components/HomeCarousel' 
import { fetchProducts } from '../sheets'
import { useAuth } from '../context/AuthContext' 

import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from '../firebase'

const SEARCH_DICTIONARY = [
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

  ['liquid', 'рідина', 'жижа', 'сольова', 'сіль', 'salt', 'заправка', 'натуральна', 'органіка'],
  ['cartridge', 'картридж', 'катридж', 'картік', 'картик', 'pod', 'под', 'карт'],
  ['coil', 'койл', 'коіл', 'випарник', 'іспарітель', 'испаритель', 'іспарік', 'іспарик'],
  ['kit', 'набір', 'старт', 'стартовий', 'система', 'под система', 'pod система'],

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

        <Box position="relative" px={{ base: 0, md: 10 }} zIndex={1}> 
           <HomeCarousel />
        </Box>

      </Container>

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

        <Divider my={12} />
        <StoreReviewsSection />

      </Container>
    </Box>
  )
}

const ProductCarouselSection = ({ title, products, icon, color, linkTo }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
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

// 👇 ОНОВЛЕНИЙ КОМПОНЕНТ ЗІРОЧОК ДЛЯ ФОРМИ (Чорний контур для порожніх)
const StarRating = ({ rating, setRating }) => {
  return (
    <HStack spacing={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          cursor={setRating ? "pointer" : "default"}
          onClick={() => setRating && setRating(star)}
          transition="transform 0.1s"
          _hover={setRating ? { transform: "scale(1.2)" } : {}}
          display="inline-flex"
          position="relative"
          w="30px"
          h="30px"
          justifyContent="center"
          alignItems="center"
        >
          {/* Зірка-основа (обведення) */}
          <Text
            position="absolute"
            fontSize="3xl"
            color="white"
            sx={{
              WebkitTextStroke: "1.5px black",
              opacity: star <= rating ? 0 : 1 // Показуємо обведення тільки якщо зірка порожня
            }}
          >
            ★
          </Text>
          {/* Зірка-заливка (рожева, якщо активна, інакше прозора) */}
          <Text
            position="absolute"
            fontSize="3xl"
            color={star <= rating ? "#FF0080" : "transparent"}
          >
            ★
          </Text>
        </Box>
      ))}
    </HStack>
  )
}

// КАРУСЕЛЬ ВІДГУКІВ ТА ФОРМА ДОДАВАННЯ
const StoreReviewsSection = () => {
  const [reviews, setReviews] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const cardsVisible = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 3, xl: 3 }) || 3
  
  const { currentUser } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const [authorName, setAuthorName] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [ratingSite, setRatingSite] = useState(5)
  const [ratingDelivery, setRatingDelivery] = useState(5)
  const [ratingStore, setRatingStore] = useState(5)
  const [ratingConsultation, setRatingConsultation] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "store_reviews"), orderBy("createdAt", "desc"), limit(12))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => {
        const r = doc.data()
        let formattedDate = "Нещодавно"
        if (r.createdAt?.toDate) {
          formattedDate = r.createdAt.toDate().toLocaleDateString('uk-UA')
        }
        return { id: doc.id, ...r, date: formattedDate }
      })
      setReviews(data)
    } catch (e) {
      console.error("Помилка завантаження відгуків: ", e)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    if (currentUser?.displayName) {
      setAuthorName(currentUser.displayName)
    }
  }, [currentUser])

  const submitReview = async () => {
    if (!authorName.trim() || !reviewText.trim()) {
      toast({ title: "Заповніть всі поля!", status: "error", position: "top", duration: 2000 })
      return
    }
    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "store_reviews"), {
        authorName: authorName.trim(),
        text: reviewText.trim(),
        ratingSite,
        ratingDelivery,
        ratingStore,
        ratingConsultation,
        createdAt: serverTimestamp()
      })
      toast({ title: "Відгук успішно додано! Дякуємо!", status: "success", position: "top", duration: 3000 })
      setReviewText('')
      setRatingSite(5)
      setRatingDelivery(5)
      setRatingStore(5)
      setRatingConsultation(5)
      onClose()
      fetchReviews() 
    } catch (error) {
      console.error(error)
      toast({ title: "Помилка збереження. Перевірте Firebase Rules.", status: "error", position: "top", duration: 4000 })
    }
    setIsSubmitting(false)
  }

  const avgRatingRaw = reviews.length > 0 
    ? (reviews.reduce((acc, r) => {
        const sum = (r.ratingSite || 5) + (r.ratingDelivery || 5) + (r.ratingStore || 5) + (r.ratingConsultation || 5);
        return acc + (sum / 4);
      }, 0) / reviews.length)
    : 5.0;

  const avgRating = avgRatingRaw.toFixed(1).replace('.', ',');

  const maxIndex = Math.max(0, reviews.length - cardsVisible)

  const nextSlide = () => {
    if (currentIndex < maxIndex) setCurrentIndex(prev => prev + 1)
    else setCurrentIndex(0)
  }

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
    else setCurrentIndex(maxIndex)
  }

  return (
    <Box mb={10} position="relative">
      
      <Flex justify="space-between" align={{ base: "start", md: "center" }} mb={6} direction={{ base: "column", md: "row" }} gap={4} borderBottom="3px solid black" pb={4}>
        
        <Flex align="center" gap={4}>
          <Text fontSize={{ base: "4xl", md: "5xl" }} color="#FF0080" lineHeight="1">⭐</Text>
          <Text fontSize={{ base: "5xl", md: "6xl" }} fontWeight="900" lineHeight="1">{avgRating}</Text>
          <Box>
            <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" textTransform="uppercase" color="black">
              Відгуки про магазин
            </Heading>
            <Text color="gray.500" fontSize="sm">Усього відгуків: {reviews.length}</Text>
          </Box>
        </Flex>

        <Flex gap={4} align="center" w={{ base: "full", md: "auto" }} justify={{ base: "space-between", md: "flex-end" }}>
          <Link to="/reviews" style={{ color: '#FF0080', textDecoration: 'underline', fontSize: '14px', fontWeight: 'bold' }}>
            Дивитись всі відгуки
          </Link>
          <Button size="md" bg="#FF0080" color="white" borderRadius="12px" _hover={{ bg: "black" }} onClick={onOpen}>
            Залишити відгук
          </Button>
        </Flex>

      </Flex>

      {reviews.length === 0 ? (
         <Center h="150px" border="2px dashed #eee" borderRadius="24px" flexDirection="column">
            <Text color="gray.400" mb={2}>Поки немає відгуків.</Text>
            <Button size="sm" onClick={onOpen} variant="outline" colorScheme="pink">Будьте першим!</Button>
         </Center>
      ) : (
        <Box position="relative" px={{ base: 0, md: 10 }}>
          
          {reviews.length > cardsVisible && (
            <IconButton 
              icon={<FiChevronLeft size={24} />}
              position="absolute"
              left={{ base: "-10px", md: "-20px", xl: "-40px" }}
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

          <Box overflow="hidden" py={4} mx="-8px">
            <Flex 
              transition="transform 0.5s ease-in-out"
              transform={`translateX(-${currentIndex * (100 / cardsVisible)}%)`}
            >
              {reviews.map((rev) => (
                <Box key={rev.id} minW={`${100 / cardsVisible}%`} px="8px" flexShrink={0}>
                  <Box bg="black" color="white" border="2px solid black" borderRadius="24px" p={6} h="220px" display="flex" flexDirection="column" justify="space-between" boxShadow="md">
                    <Box>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontWeight="bold" fontSize="lg" color="#FF0080" noOfLines={1}>
                          {rev.authorName}
                        </Text>
                        <Text fontSize="xs" color="gray.500">{rev.date}</Text>
                      </Flex>
                      
                      <VStack align="start" spacing={1} mb={3} fontSize="xs" fontWeight="bold">
                        <Flex justify="space-between" w="full">
                          <Text color="gray.400">Оцінка сайту:</Text>
                          <Text color="#FF0080">⭐ {rev.ratingSite || 5}</Text>
                        </Flex>
                        <Flex justify="space-between" w="full">
                          <Text color="gray.400">Доставка:</Text>
                          <Text color="#FF0080">⭐ {rev.ratingDelivery || 5}</Text>
                        </Flex>
                        <Flex justify="space-between" w="full">
                          <Text color="gray.400">Оцінка магазина:</Text>
                          <Text color="#FF0080">⭐ {rev.ratingStore || 5}</Text>
                        </Flex>
                        <Flex justify="space-between" w="full">
                          <Text color="gray.400">Консультація:</Text>
                          <Text color="#FF0080">⭐ {rev.ratingConsultation || 5}</Text>
                        </Flex>
                      </VStack>

                      <Text fontSize="sm" color="gray.300" noOfLines={4}>
                        {rev.text}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Flex>
          </Box>

          {reviews.length > cardsVisible && (
            <IconButton 
              icon={<FiChevronRight size={24} />}
              position="absolute"
              right={{ base: "-10px", md: "-20px", xl: "-40px" }}
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
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent border="2px solid black" borderRadius="24px" maxH="90vh" overflowY="auto">
          <ModalHeader color="#FF0080" fontWeight="900" textTransform="uppercase">Твій відгук 💬</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Ваше ім'я</FormLabel>
                <Input 
                  value={authorName} 
                  onChange={(e) => setAuthorName(e.target.value)} 
                  placeholder="Як до вас звертатись?" 
                  borderRadius="12px" 
                  border="2px solid black" 
                  _focus={{ borderColor: "#FF0080", boxShadow: "0 0 0 1px #FF0080" }} 
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Оцінка сайту</FormLabel>
                <StarRating rating={ratingSite} setRating={setRatingSite} />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Доставка</FormLabel>
                <StarRating rating={ratingDelivery} setRating={setRatingDelivery} />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Оцінка магазину</FormLabel>
                <StarRating rating={ratingStore} setRating={setRatingStore} />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Консультація</FormLabel>
                <StarRating rating={ratingConsultation} setRating={setRatingConsultation} />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Коментар</FormLabel>
                <Textarea 
                  value={reviewText} 
                  onChange={(e) => setReviewText(e.target.value)} 
                  placeholder="Що сподобалось, а що варто покращити?" 
                  borderRadius="12px" 
                  border="2px solid black" 
                  _focus={{ borderColor: "#FF0080", boxShadow: "0 0 0 1px #FF0080" }} 
                  resize="none" 
                  rows={3} 
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid #eee">
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="12px">Скасувати</Button>
            <Button bg="#FF0080" color="white" borderRadius="12px" _hover={{ bg: "black" }} onClick={submitReview} isLoading={isSubmitting}>
              Надіслати
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  )
}

export default HomePage