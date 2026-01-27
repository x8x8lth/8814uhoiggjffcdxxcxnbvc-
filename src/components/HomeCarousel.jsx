import React, { useState, useEffect } from 'react'
import { Box, IconButton, Image, Flex, Skeleton } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import { fetchBanners } from '../sheets'

function HomeCarousel() {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners().then(data => {
      if (data.length > 0) {
        setSlides(data)
      } else {
        // 👇 Твої старі резервні банери
        setSlides([
          { image: "https://uvape.com.ua/modules/ps_imageslider/images/8051e24749f711202867015431677334585c543f_baner-pc-chaser.webp", link: "/category/liquids" },
          { image: "https://uvape.com.ua/modules/ps_imageslider/images/9142e0300623156096538e1247072535728a420b_baner-pc-elf-bar.webp", link: "/category/pods" }
        ])
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrent((curr) => (curr === slides.length - 1 ? 0 : curr + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const prevSlide = () => setCurrent((curr) => (curr === 0 ? slides.length - 1 : curr - 1))
  const nextSlide = () => setCurrent((curr) => (curr === slides.length - 1 ? 0 : curr + 1))

  if (loading) return <Skeleton height={{ base: "200px", md: "400px" }} borderRadius="24px" />
  if (slides.length === 0) return null

  return (
    <Box position="relative" w="full" mx="auto">
      
      {/* ВНУТРІШНІЙ БЛОК (Слайди + Рамка) */}
      <Box 
        overflow="hidden" 
        borderRadius="24px" 
        border="2px solid black"
        position="relative"
        bg="white"
        h={{ base: "200px", md: "450px" }} // Висота трохи менша, щоб влазило в контейнер
      >
        <Flex 
          w="full" h="full"
          transition="transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)"
          transform={`translateX(-${current * 100}%)`}
        >
          {slides.map((slide, index) => (
            <Box 
              key={index} minW="100%" h="full" 
              as={Link} to={slide.link || '#'} 
              position="relative"
            >
              <Image 
                src={slide.image} 
                w="full" 
                h="full" 
                objectFit="cover" 
                objectPosition="center"
              />
            </Box>
          ))}
        </Flex>
      </Box>

      {/* СТРІЛКА ВЛІВО */}
      <IconButton
        aria-label="Previous Slide"
        icon={<ChevronLeftIcon w={8} h={8} />}
        position="absolute"
        top="50%"
        // 👇 На ПК зсуваємо вліво (-60px), на мобільному залишаємо всередині (10px)
        left={{ base: "10px", md: "-60px" }} 
        transform="translateY(-50%)"
        zIndex={2}
        isRound
        bg="black"
        color="white"
        border="2px solid black"
        _hover={{ bg: "#FF0080", transform: "translateY(-50%) scale(1.1)" }}
        _active={{ transform: "translateY(-50%) scale(0.95)" }}
        onClick={prevSlide}
        size="lg"
      />

      {/* СТРІЛКА ВПРАВО */}
      <IconButton
        aria-label="Next Slide"
        icon={<ChevronRightIcon w={8} h={8} />}
        position="absolute"
        top="50%"
        // 👇 На ПК зсуваємо вправо (-60px), на мобільному залишаємо всередині (10px)
        right={{ base: "10px", md: "-60px" }} 
        transform="translateY(-50%)"
        zIndex={2}
        isRound
        bg="black"
        color="white"
        border="2px solid black"
        _hover={{ bg: "#FF0080", transform: "translateY(-50%) scale(1.1)" }}
        _active={{ transform: "translateY(-50%) scale(0.95)" }}
        onClick={nextSlide}
        size="lg"
      />

      {/* ІНДИКАТОРИ (Крапки знизу) */}
      <Flex position="absolute" bottom="15px" left="50%" transform="translateX(-50%)" gap={2} zIndex={3}>
        {slides.map((_, idx) => (
          <Box
            key={idx}
            w={current === idx ? "30px" : "10px"}
            h="10px"
            bg={current === idx ? "#FF0080" : "white"}
            borderRadius="full"
            border="1px solid black"
            transition="all 0.3s"
            cursor="pointer"
            onClick={() => setCurrent(idx)}
            boxShadow="0px 2px 4px rgba(0,0,0,0.2)"
          />
        ))}
      </Flex>

    </Box>
  )
}

export default HomeCarousel