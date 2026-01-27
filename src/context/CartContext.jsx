import React, { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem('cart')
    return localData ? JSON.parse(localData) : []
  })
  
  const toast = useToast()

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // 👇 ОНОВЛЕНА ФУНКЦІЯ ДОДАВАННЯ
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      
      // Отримуємо ліміт товару (якщо немає інфи, вважаємо що 999)
      const stockLimit = product.stockCount !== undefined ? product.stockCount : 999
      const currentQty = existingItem ? existingItem.quantity : 0

      // ПЕРЕВІРКА: Чи не перевищуємо ліміт?
      if (currentQty + quantity > stockLimit) {
        toast({
          title: "Обмежена кількість!",
          description: `На складі всього ${stockLimit} шт.`,
          status: "warning",
          duration: 2000,
          isClosable: true,
          position: "top"
        })
        return prevCart // Повертаємо старий кошик без змін
      }

      toast({ 
        title: "Додано в кошик", 
        status: "success", 
        duration: 1000, 
        isClosable: true,
        position: "top-right"
      })

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prevCart, { ...product, quantity: quantity }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  // 👇 ОНОВЛЕНА ФУНКЦІЯ ЗБІЛЬШЕННЯ (+)
  const increaseQuantity = (productId) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === productId) {
          const stockLimit = item.stockCount !== undefined ? item.stockCount : 999
          
          if (item.quantity + 1 > stockLimit) {
            toast({
              title: "Максимум на складі!",
              status: "warning",
              duration: 1000,
              position: "top"
            })
            return item // Не збільшуємо
          }
          return { ...item, quantity: item.quantity + 1 }
        }
        return item
      })
    })
  }

  const decreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    )
  }

  const clearCart = () => setCart([])

  const totalPrice = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}