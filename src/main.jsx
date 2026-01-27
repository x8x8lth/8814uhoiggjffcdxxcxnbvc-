import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import theme from './theme'
import './index.css'
// 👇 Імпортуємо обидва провайдери
import { AuthProvider } from './context/AuthContext' 
import { CartProvider } from './context/CartContext' // 👈 ТИ ЗАБУВ ЦЕЙ ІМПОРТ

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        {/* 👇 ОБОВ'ЯЗКОВО ОБГОРТАЄМО В CARTPROVIDER */}
        <CartProvider> 
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
)