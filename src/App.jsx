import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

// Імпорт компонентів
import Header from './components/Header'
import AgeVerificationModal from './components/AgeVerificationModal'
import Footer from './components/Footer' 
import ScrollToTop from './components/ScrollToTop' // 👈 Додали імпорт модуля

// Імпорт сторінок
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import AboutPage from './pages/AboutPage'
import ContactsPage from './pages/ContactsPage'
import SearchResultsPage from './pages/SearchResultsPage'

// НОВІ СТОРІНКИ
import DeliveryPage from './pages/DeliveryPage'
import OfferPage from './pages/OfferPage'
import ReviewsPage from './pages/ReviewsPage'

function App() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {/* 👇 ДОДАНО МОДУЛЬ ScrollToTop (працює глобально для всіх сторінок) */}
      <ScrollToTop />
      
      {/* Перевірка віку */}
      <AgeVerificationModal />
      
      {/* Шапка сайту */}
      <Header />
      
      {/* Основний контент (розтягується на всю висоту) */}
      <Box flex="1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          
          {/* НОВІ МАРШРУТИ */}
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
        </Routes>
      </Box>

      <Footer />
    </Box>
  )
}

export default App