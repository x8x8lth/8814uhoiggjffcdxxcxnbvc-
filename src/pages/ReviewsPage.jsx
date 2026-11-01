import React, { useState, useEffect } from 'react'
import { 
  Box, Container, Heading, Flex, Text, VStack, HStack, Button, 
  SimpleGrid, Spinner, Center, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalFooter, ModalBody, ModalCloseButton, 
  FormControl, FormLabel, Input, Textarea, useDisclosure, useToast, Grid 
} from '@chakra-ui/react'
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

// 👇 ОНОВЛЕНИЙ Компонент зірочок (додано чорне обведення для порожніх зірок)
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

function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
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
      const q = query(collection(db, "store_reviews"), orderBy("createdAt", "desc"))
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
    } finally {
      setLoading(false)
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
      toast({ title: "Відгук успішно додано!", status: "success", position: "top", duration: 3000 })
      setReviewText('')
      setRatingSite(5)
      setRatingDelivery(5)
      setRatingStore(5)
      setRatingConsultation(5)
      onClose()
      fetchReviews() 
    } catch (error) {
      console.error(error)
      toast({ title: "Помилка збереження.", status: "error", position: "top", duration: 4000 })
    }
    setIsSubmitting(false)
  }

  const totalReviews = reviews.length;
  const avgRatingRaw = totalReviews > 0 
    ? (reviews.reduce((acc, r) => {
        const sum = (r.ratingSite || 5) + (r.ratingDelivery || 5) + (r.ratingStore || 5) + (r.ratingConsultation || 5);
        return acc + (sum / 4);
      }, 0) / totalReviews)
    : 5.0;
  
  const avgRating = avgRatingRaw.toFixed(1).replace('.', ',');

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (totalReviews > 0) {
    reviews.forEach(r => {
      const avg = Math.round(((r.ratingSite || 5) + (r.ratingDelivery || 5) + (r.ratingStore || 5) + (r.ratingConsultation || 5)) / 4);
      const boundedAvg = Math.max(1, Math.min(5, avg));
      distribution[boundedAvg]++;
    });
  }

  if (loading) {
    return (
      <Center h="70vh">
        <Spinner size="xl" color="#FF0080" thickness="4px" />
      </Center>
    )
  }

  return (
    <Box bg="#f0f2f5" minH="100vh" py={10}>
      <Container maxW="container.xl">
        
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={12}>
          
          <Flex 
            direction="column" 
            justify="center" 
            align={{ base: "center", md: "flex-start" }} 
            bg="white" p={6} borderRadius="24px" border="2px solid black" boxShadow="md"
            textAlign={{ base: "center", md: "left" }}
          >
            <Flex align="center" gap={3} mb={3}>
              <Text fontSize={{ base: "5xl", md: "6xl" }} color="#FF0080" lineHeight="1">⭐</Text>
              <Text fontSize={{ base: "5xl", md: "6xl" }} fontWeight="900" lineHeight="1">{avgRating}</Text>
            </Flex>
            
            <Heading fontSize={{ base: "lg", md: "xl" }} fontWeight="900" textTransform="uppercase" color="black" mb={1}>
              Відгуки про магазин
            </Heading>
            <Text color="gray.500" fontSize="sm" fontWeight="bold" mb={6}>Усього оцінок: {totalReviews}</Text>
            
            <Button size="md" bg="#FF0080" color="white" borderRadius="12px" h="48px" px={8} fontSize="md" _hover={{ bg: "black" }} onClick={onOpen}>
              Залишити відгук
            </Button>
          </Flex>

          <Box bg="white" p={6} borderRadius="24px" border="2px solid black" boxShadow="md" display="flex" flexDirection="column" justify="center">
            <Heading fontSize="lg" fontWeight="900" mb={4} textTransform="uppercase" textAlign={{ base: "center", md: "left" }}>
              Оцінки
            </Heading>
            
            <VStack align="stretch" spacing={3} w="full">
              {[5, 4, 3, 2, 1].map(star => {
                const count = distribution[star];
                const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <Flex key={star} align="center" gap={3}>
                    <Flex align="center" gap={1} w="30px" justify="flex-end">
                      <Text fontWeight="bold" fontSize="md">{star}</Text>
                      <Text color={count > 0 ? "#FF0080" : "gray.300"} fontSize="md">★</Text>
                    </Flex>
                    
                    <Box flex={1} bg="gray.100" h="10px" borderRadius="full" overflow="hidden" border="1px solid #eee">
                      <Box w={`${percent}%`} bg="#FF0080" h="100%" borderRadius="full" transition="width 0.5s ease-in-out" />
                    </Box>
                    
                    <Text fontSize="sm" color="gray.500" w="20px" textAlign="right" fontWeight="bold">{count}</Text>
                  </Flex>
                )
              })}
            </VStack>
          </Box>

        </Grid>

        {reviews.length === 0 ? (
          <Center h="300px" border="2px dashed gray" borderRadius="24px" flexDirection="column">
            <Text fontSize="xl" color="gray.500" mb={4}>Тут поки що порожньо 😔</Text>
            <Button onClick={onOpen} colorScheme="pink">Станьте першим!</Button>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
            {reviews.map(rev => (
              <Box key={rev.id} bg="black" color="white" border="2px solid black" borderRadius="24px" p={6} display="flex" flexDirection="column" boxShadow="lg">
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontWeight="bold" fontSize="xl" color="#FF0080" noOfLines={1}>
                    {rev.authorName}
                  </Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">{rev.date}</Text>
                </Flex>
                
                <VStack align="start" spacing={1} mb={4} fontSize="xs" fontWeight="bold" bg="#1a1a1a" p={3} borderRadius="12px">
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

                <Text fontSize="sm" color="gray.300" flex={1}>
                  {rev.text}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        )}

      </Container>

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

export default ReviewsPage