import React, { useEffect, useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Text, VStack, HStack, Heading
} from '@chakra-ui/react'

function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const isAgeConfirmed = localStorage.getItem('age-confirmed')
    if (!isAgeConfirmed) {
      setIsOpen(true)
    }
  }, [])

  const handleConfirm = () => {
    localStorage.setItem('age-confirmed', 'true')
    setIsOpen(false)
  }

  const handleReject = () => {
    window.location.href = 'https://vt.tiktok.com/ZSamydNBd/'
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} isCentered closeOnOverlayClick={false} closeOnEsc={false} size="lg">
      <ModalOverlay backdropFilter="blur(10px)" bg="rgba(0,0,0,0.4)" />
      
      <ModalContent 
        bg="white" 
        color="black" 
        border="2px solid black" 
        borderRadius="24px"  // 👈 Новий радіус
        p={6}
        boxShadow="0px 20px 40px rgba(0,0,0,0.2)"
      >
        <ModalHeader textAlign="center" pt={2} pb={4}>
          <Heading size="lg" textTransform="uppercase">🔞 Перевірка віку</Heading>
        </ModalHeader>

        <ModalBody>
          <VStack spacing={4} textAlign="center">
            <Text fontSize="xl" fontWeight="bold">Вам вже виповнилось 18 років?</Text>
            <Text fontSize="md" color="gray.500">
              Цей сайт містить продукцію, призначену тільки для повнолітніх.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter pt={8} pb={2} justifyContent="center">
          <HStack spacing={4} w="full">
            <Button 
              onClick={handleReject} variant="outline" w="full" h="50px" fontSize="lg"
              borderRadius="12px" border="2px solid black" // 👈
              _hover={{ bg: "gray.100" }}
            >
              Ні
            </Button>
            <Button 
              onClick={handleConfirm} w="full" h="50px" fontSize="lg"
              bg="#FF0080" color="white" borderRadius="12px" border="2px solid black" // 👈
              _hover={{ bg: "#D6006B", transform: "translateY(-2px)", boxShadow: "0px 5px 15px rgba(255, 0, 128, 0.4)" }}
            >
              Так, мені є 18
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AgeVerificationModal