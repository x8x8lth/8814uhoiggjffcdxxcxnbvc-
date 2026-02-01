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

  // 👇 ОНОВЛЕНА ФУНКЦІЯ ДОДАВАННЯ (З урахуванням опцій)
  const addToCart = (product, quantity = 1, selectedOptions = []) => {
    setCart((prevCart) => {
      
      // 1. Рахуємо ціну допів
      const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0)
      
      // 2. Створюємо унікальний ключ для товару (щоб розрізняти "Жижу" і "Жижу + Бустер")
      // Генеруємо ID: "IDтовару-НазваОпції1-НазваОпції2"
      const optionsKey = selectedOptions.length > 0 
        ? '-' + selectedOptions.map(o => o.name).sort().join('-') 
        : ''
      
      const cartItemId = `${product.id}${optionsKey}`

      // 3. Шукаємо, чи є вже САМЕ ТАКА комплектація в кошику
      const existingItem = prevCart.find((item) => item.cartItemId === cartItemId)
      
      // Ліміт беремо з оригінального товару
      const stockLimit = product.stockCount !== undefined ? product.stockCount : 999
      const currentQty = existingItem ? existingItem.quantity : 0

      if (currentQty + quantity > stockLimit) {
        toast({
          title: "Обмежена кількість!",
          description: `На складі всього ${stockLimit} шт.`,
          status: "warning",
          duration: 2000,
          isClosable: true,
          position: "top"
        })
        return prevCart
      }

      toast({ 
        title: "Додано в кошик", 
        description: selectedOptions.length > 0 ? `+ ${selectedOptions.map(o => o.name).join(', ')}` : undefined,
        status: "success", 
        duration: 1000, 
        isClosable: true,
        position: "top-right"
      })

      if (existingItem) {
        return prevCart.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prevCart, { 
            ...product, 
            cartItemId: cartItemId, // Зберігаємо новий унікальний ID
            originalId: product.id, // Зберігаємо оригінальний ID для зв'язку
            price: product.price + optionsPrice, // Ціна вже з допами
            basePrice: product.price, // Запам'ятовуємо базову ціну
            selectedOptions: selectedOptions, // Зберігаємо список допів
            quantity: quantity 
        }]
      }
    })
  }

  // Видаляємо по cartItemId (унікальному), а не по id товару
  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId))
  }

  const increaseQuantity = (cartItemId) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.cartItemId === cartItemId) {
          const stockLimit = item.stockCount !== undefined ? item.stockCount : 999
          
          if (item.quantity + 1 > stockLimit) {
            toast({
              title: "Максимум на складі!",
              status: "warning",
              duration: 1000,
              position: "top"
            })
            return item
          }
          return { ...item, quantity: item.quantity + 1 }
        }
        return item
      })
    })
  }

  const decreaseQuantity = (cartItemId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemId === cartItemId && item.quantity > 1
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