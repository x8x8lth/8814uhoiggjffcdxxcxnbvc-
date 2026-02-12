import React, { useState, useEffect } from 'react'
import { 
  Box, Heading, Text, Button, VStack, HStack, Avatar, 
  Textarea, Divider, Flex, useToast, Center, Badge 
} from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'
import { FcGoogle } from 'react-icons/fc' 
import { FiCheckCircle, FiAlertCircle, FiMessageSquare } from 'react-icons/fi'

import { auth, db, googleProvider } from '../firebase' 
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore'

function ProductReviews({ product }) {
  const toast = useToast()
  
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ text: '', rating: 5 })
  const [isFormOpen, setIsFormOpen] = useState(false)

  // 1. Слухаємо авторизацію
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // 👇 ФУНКЦІЯ ДЛЯ КАСТОМНИХ СПОВІЩЕНЬ
  const showReviewToast = (title, status = 'success') => {
      toast({
        position: 'top',
        duration: 3000,
        render: () => (
          <Box
            color="white"
            p={4}
            bg={status === 'error' || status === 'warning' ? '#FF0080' : 'black'}
            borderRadius="xl"
            boxShadow="0px 4px 15px rgba(255, 0, 128, 0.4)"
            border="2px solid white"
            textAlign="center"
            minW="250px"
          >
            <Flex align="center" justify="center" direction="column">
              {status === 'success' ? <FiCheckCircle size={24} /> : <FiAlertCircle size={24} />}
              <Text fontWeight="800" fontSize="md" mt={2} textTransform="uppercase">
                {title}
              </Text>
            </Flex>
          </Box>
        ),
      })
  }

  // 2. Функція входу
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showReviewToast("Ви успішно увійшли! 👋", "success")
    } catch (error) {
      console.error(error);
      showReviewToast("Помилка входу", "error")
    }
  }

  // 3. Завантажуємо відгуки (Live)
  useEffect(() => {
    if (!product?.id) return

    const q = query(
      collection(db, "reviews"),
      where("productId", "==", String(product.id)),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setReviews(loadedReviews)
    })

    return () => unsubscribe()
  }, [product?.id])

  // 4. Відправка
  const handleSubmit = async () => {
    if (!newReview.text.trim()) {
      showReviewToast("Напишіть хоч пару слів! ✍️", "warning")
      return
    }

    try {
      await addDoc(collection(db, "reviews"), {
        productId: String(product.id),
        userId: user.uid,
        userName: user.displayName || "Користувач",
        userPhoto: user.photoURL,
        text: newReview.text,
        rating: newReview.rating,
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString()
      })

      setNewReview({ text: '', rating: 5 })
      setIsFormOpen(false)
      showReviewToast("Дякуємо за відгук! ❤️", "success")

    } catch (error) {
      console.error("Error adding review: ", error)
      showReviewToast("Помилка. Спробуйте пізніше.", "error")
    }
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  return (
    <Box mt={16} id="reviews">
      <Heading size="lg" mb={8} textTransform="uppercase" borderBottom="3px solid black" pb={2} display="inline-block">
        Відгуки ({reviews.length})
      </Heading>

      <Flex direction={{ base: "column", md: "row" }} gap={10} mb={10}>
        
        {/* ЛІВА КОЛОНКА */}
        <Box flex="1" bg="gray.50" p={6} borderRadius="24px" h="fit-content" border="1px solid #eee">
            <Flex align="center" mb={4}>
              <Text fontSize="5xl" fontWeight="900" lineHeight="1" mr={4}>{averageRating}</Text>
              <VStack align="start" spacing={0}>
                <HStack>
                  {[1,2,3,4,5].map(i => (
                    <StarIcon key={i} color={i <= Math.round(Number(averageRating)) ? "orange.400" : "gray.300"} w={5} h={5} />
                  ))}
                </HStack>
                <Text fontSize="sm" color="gray.500">{reviews.length} відгуків</Text>
              </VStack>
            </Flex>
            
            <Divider mb={4} borderColor="gray.300" />

            {!user ? (
              <Button 
                w="full" mt={2} leftIcon={<FcGoogle />}
                bg="white" color="black" border="2px solid black" borderRadius="14px"
                _hover={{ bg: "gray.100" }}
                onClick={handleLogin}
                h="50px" fontSize="md"
              >
                Авторизуватись для відгуку
              </Button>
            ) : (
              <VStack mt={2} spacing={3} w="full">
                <Flex align="center" gap={3} w="full" bg="white" p={2} borderRadius="12px" border="1px solid #eee">
                  <Avatar size="sm" src={user.photoURL} name={user.displayName} />
                  <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{user.displayName}</Text>
                </Flex>
                
                <Button 
                  w="full" bg="black" color="white" borderRadius="14px" h="50px"
                  _hover={{ bg: "#FF0080" }}
                  onClick={() => setIsFormOpen(!isFormOpen)}
                >
                  {isFormOpen ? "Закрити форму" : "Написати відгук"}
                </Button>
              </VStack>
            )}
        </Box>

        {/* ПРАВА КОЛОНКА */}
        <Box flex="2">
          {user && isFormOpen && (
            <Box mb={8} p={6} border="2px dashed black" borderRadius="20px" bg="white">
              <Heading size="sm" mb={4}>Ваш відгук</Heading>
              <VStack spacing={4}>
                <HStack w="full" justify="space-between">
                  <Text fontSize="sm" fontWeight="bold">Ваша оцінка:</Text>
                  <HStack>
                    {[1,2,3,4,5].map(star => (
                      <StarIcon 
                        key={star} cursor="pointer"
                        color={star <= newReview.rating ? "orange.400" : "gray.300"}
                        w={7} h={7}
                        transition="transform 0.2s"
                        _hover={{ transform: "scale(1.2)" }}
                        onClick={() => setNewReview({...newReview, rating: star})}
                      />
                    ))}
                  </HStack>
                </HStack>
                <Textarea 
                  placeholder="Ваші враження..." 
                  value={newReview.text}
                  onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                  bg="gray.50" border="none" borderRadius="12px"
                  focusBorderColor="#FF0080"
                  minH="120px"
                />
                <Button w="full" bg="#FF0080" color="white" h="50px" borderRadius="14px" _hover={{ bg: "black" }} onClick={handleSubmit}>
                  Опублікувати
                </Button>
              </VStack>
            </Box>
          )}

          {reviews.length === 0 ? (
            <Center p={10} border="1px dashed #eee" borderRadius="20px" bg="gray.50">
              <VStack>
                  <Text fontSize="2xl">💬</Text>
                  <Text color="gray.500" fontWeight="bold">Тут поки тихо...</Text>
                  <Text fontSize="sm" color="gray.400">Станьте першим, хто залишить відгук!</Text>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {reviews.map((review) => (
                <Box key={review.id} bg="white" border="1px solid #eee" borderRadius="16px" p={5} boxShadow="sm">
                  <Flex justify="space-between" mb={3} align="center">
                    <HStack>
                      <Avatar size="sm" src={review.userPhoto} name={review.userName} />
                      <Box>
                          <Text fontWeight="bold" fontSize="sm" lineHeight="1">{review.userName}</Text>
                          <HStack mt={1} spacing={1}>
                            {[1,2,3,4,5].map(i => (
                                <StarIcon key={i} color={i <= review.rating ? "orange.400" : "gray.200"} w={3} h={3} />
                            ))}
                          </HStack>
                      </Box>
                    </HStack>
                    <Badge fontSize="xs" colorScheme="gray" borderRadius="8px" px={2}>{review.date}</Badge>
                  </Flex>
                  <Text color="gray.700" fontSize="md" lineHeight="1.6" pl={10}>
                    {review.text}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Flex>
    </Box>
  )
}

export default ProductReviews