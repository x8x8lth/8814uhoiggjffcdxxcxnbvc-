import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Box, Grid, Heading, Container, Text, Spinner, Center, 
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, Flex, Button,
  Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerBody, useDisclosure,
  Menu, MenuButton, MenuList, MenuItem, IconButton, HStack
} from '@chakra-ui/react'
import { ChevronRightIcon, ChevronDownIcon, ChevronLeftIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { FiFilter } from 'react-icons/fi'

import ProductCard from '../components/ProductCard'
import FilterSidebar from '../components/FilterSidebar'
import { fetchProducts } from '../sheets'

const CATEGORY_NAMES = {
  liquids: "Рідини",
  pods: "Pod Системи",
  kits: "Стартові набори",
  parts: "Комплектуючі",
  sales: "Акції",
  new: "Новинки"
}

const SORT_NAMES = {
  'relevance': 'За релевантністю',
  'low-high': 'Від дешевих',
  'high-low': 'Від дорогих'
}

// Ліміт товарів на сторінку
const ITEMS_PER_PAGE = 12

function CategoryPage() {
  const { slug } = useParams()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const [sort, setSort] = useState('relevance')
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    onlySale: false,
    brand: [],
    country: [],
    flavor: [],      
    tasteGroup: [],
    display: [],
    material: [],
    powerMode: [],
    controlType: [],
    resistance: [],
    volume: []
  })

  useEffect(() => {
    setLoading(true)
    fetchProducts().then(data => {
      let categoryProducts = []
      
      if (slug === 'sales') {
        categoryProducts = data.filter(p => p.label && p.label.includes('sale'))
        setFilters(prev => ({...prev, onlySale: true}))
      } else if (slug === 'new') {
        categoryProducts = data.filter(p => p.label && p.label.includes('new'))
      } else {
        categoryProducts = data.filter(p => p.category && p.category.trim() === slug)
      }

      setAllProducts(categoryProducts)
      
      const prices = categoryProducts.map(p => p.price)
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000
      setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }))
      
      setLoading(false)
    })
  }, [slug])

  useEffect(() => {
    setCurrentPage(1)
  }, [slug, filters, sort])

  const filterOptions = useMemo(() => {
    const getOptions = (key) => [...new Set(allProducts.map(p => p[key]).filter(Boolean))].sort()
    return {
      brands: getOptions('brand'),
      countries: getOptions('country'),
      flavors: getOptions('flavor'),
      tasteGroups: getOptions('tasteGroup'),
      displays: getOptions('display'),
      materials: getOptions('material'),
      powerModes: getOptions('powerMode'),
      controlTypes: getOptions('controlType'),
      resistances: getOptions('resistance'),
      volumes: getOptions('volume'),
    }
  }, [allProducts])

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false
      if (filters.onlySale && !product.oldPrice) return false

      const check = (key) => {
        if (filters[key].length > 0 && !filters[key].includes(product[key])) return false
        return true
      }

      if (!check('brand')) return false
      
      if (slug === 'liquids') {
        if (!check('country') || !check('tasteGroup') || !check('flavor')) return false 
      }
      if (slug === 'pods') {
        if (!check('display') || !check('material') || !check('powerMode') || !check('controlType')) return false
      }
      if (slug === 'parts') {
        if (!check('resistance') || !check('volume')) return false
      }
      return true
    })
  }, [allProducts, filters, slug])

  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts]
    if (sort === 'low-high') sorted.sort((a, b) => a.price - b.price)
    else if (sort === 'high-low') sorted.sort((a, b) => b.price - a.price)
    return sorted
  }, [filteredProducts, sort])


  const pageCount = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  const currentProducts = sortedProducts.slice(offset, offset + ITEMS_PER_PAGE)

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return <Center h="50vh"><Spinner size="xl" thickness='4px' /></Center>

  return (
    <Container maxW="container.xl" py={8}>
      
      <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />} mb={6} fontSize="sm">
        <BreadcrumbItem><BreadcrumbLink as={Link} to='/'>Головна</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbItem isCurrentPage><BreadcrumbLink fontWeight='bold'>{CATEGORY_NAMES[slug] || slug}</BreadcrumbLink></BreadcrumbItem>
      </Breadcrumb>

      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Heading textTransform="uppercase" size="lg">
          {CATEGORY_NAMES[slug] || "Каталог"} <Text as="span" color="gray.400" fontSize="md">({sortedProducts.length})</Text>
        </Heading>

        <Flex gap={2} align="center">
          <Button leftIcon={<FiFilter />} display={{ base: 'flex', md: 'none' }} onClick={onOpen} variant="outline" size="sm" border="2px solid black" borderRadius="8px">
            Фільтри
          </Button>

          <Menu placement="bottom-end">
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />} 
              variant="outline" 
              size="sm"
              border="2px solid black"
              borderRadius="8px"
              _hover={{ bg: "gray.100" }}
              _active={{ bg: "gray.200" }}
              minW="180px"
              textAlign="left"
            >
              {SORT_NAMES[sort]}
            </MenuButton>
            <MenuList border="2px solid black" borderRadius="12px" boxShadow="0px 5px 15px rgba(0,0,0,0.1)" zIndex={10}>
              <MenuItem onClick={() => setSort('relevance')} fontWeight={sort === 'relevance' ? 'bold' : 'normal'}>За релевантністю</MenuItem>
              <MenuItem onClick={() => setSort('low-high')} fontWeight={sort === 'low-high' ? 'bold' : 'normal'}>Від дешевих до дорогих</MenuItem>
              <MenuItem onClick={() => setSort('high-low')} fontWeight={sort === 'high-low' ? 'bold' : 'normal'}>Від дорогих до дешевих</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <Flex gap={8} align="start">
        <Box display={{ base: 'none', md: 'block' }}>
          <FilterSidebar 
            categorySlug={slug} 
            filters={filters} 
            setFilters={setFilters} 
            options={filterOptions}
            minMaxPrice={[0, 10000]} 
          />
        </Box>

        <Box flex="1">
          {currentProducts.length > 0 ? (
            <>
              {/* СІТКА */}
              <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4} mb={10}>
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Grid>

              {/* 👇 БЛОК НАВІГАЦІЇ */}
              {pageCount > 1 && (
                <Flex justify="center" align="center" gap={8} mt={8} direction="column" w="full">
                  
                  {/* 1. КНОПКА "ЗАВАНТАЖИТИ ЩЕ" (НА ВСЮ ШИРИНУ) */}
                  {currentPage < pageCount && (
                     <Button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        w="full" // 👈 НА ВСЮ ШИРИНУ
                        variant="outline"
                        borderColor="#FF0080"
                        color="#FF0080"
                        bg="white"
                        size="lg" 
                        h="60px" // Висока і зручна
                        borderRadius="20px" 
                        _hover={{ bg: "#FF0080", color: "white" }} 
                        rightIcon={<ArrowForwardIcon />}
                        textTransform="uppercase"
                        fontWeight="900"
                        fontFamily="monospace" // 👈 ІНШИЙ ШРИФТ (Моноширинний)
                        letterSpacing="2px"
                        fontSize="lg"
                        boxShadow="0px 4px 15px rgba(255, 0, 128, 0.2)"
                      >
                        Завантажити ще
                      </Button>
                  )}

                  {/* 2. НОМЕРИ СТОРІНОК */}
                  <HStack spacing={2}>
                    <IconButton 
                        icon={<ChevronLeftIcon w={6} h={6} />}
                        onClick={() => handlePageChange(currentPage - 1)}
                        isDisabled={currentPage === 1}
                        variant="outline"
                        border="2px solid black"
                        borderRadius="12px"
                        _hover={{ bg: "black", color: "white" }}
                        aria-label="Previous Page"
                    />

                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? "solid" : "outline"}
                        bg={currentPage === page ? "black" : "transparent"}
                        color={currentPage === page ? "white" : "black"}
                        border="2px solid black"
                        borderRadius="12px"
                        w="40px" h="40px"
                        _hover={{ 
                            bg: "black", 
                            color: "white", 
                            borderColor: "black",
                            transform: "scale(1.1)"
                        }}
                        transition="all 0.2s"
                      >
                        {page}
                      </Button>
                    ))}

                    <IconButton 
                        icon={<ChevronRightIcon w={6} h={6} />}
                        onClick={() => handlePageChange(currentPage + 1)}
                        isDisabled={currentPage === pageCount}
                        variant="outline"
                        border="2px solid black"
                        borderRadius="12px"
                        _hover={{ bg: "black", color: "white" }}
                        aria-label="Next Page"
                    />
                  </HStack>

                </Flex>
              )}
            </>
          ) : (
            <Center h="200px" flexDirection="column" border="2px dashed #eee" borderRadius="16px">
              <Text fontSize="lg" fontWeight="bold" color="gray.500">Нічого не знайдено 😔</Text>
              <Button mt={4} size="sm" onClick={() => window.location.reload()}>Скинути все</Button>
            </Center>
          )}
        </Box>
      </Flex>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody py={8}>
            <Heading size="md" mb={6}>Фільтри</Heading>
            <FilterSidebar 
              categorySlug={slug} 
              filters={filters} 
              setFilters={setFilters} 
              options={filterOptions}
              minMaxPrice={[0, 10000]}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

    </Container>
  )
}

export default CategoryPage