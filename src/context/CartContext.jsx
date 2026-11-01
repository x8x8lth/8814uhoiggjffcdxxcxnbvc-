import React, { createContext, useContext, useState, useEffect } from 'react'
import { useToast, Box, Flex, Text } from '@chakra-ui/react'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  // Ініціалізація стану кошика з localStorage
  const [cart, setCart] = useState(() => {
    try {
      const localData = localStorage.getItem('cart')
      return localData ? JSON.parse(localData) : []
    } catch (e) {
      console.error("Помилка читання кошика з localStorage:", e)
      return []
    }
  })
  
  const toast = useToast()

  // Збереження кошика в localStorage при зміні
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // 👇 ФУНКЦІЯ ДЛЯ КАСТОМНИХ СПОВІЩЕНЬ
  const showCartToast = (title, description = null, status = 'success') => {
    toast({
      position: 'top',
      duration: 2000,
      render: () => (
        <Box
          color="white"
          p={4}
          bg={status === 'warning' ? '#FF0080' : 'black'}
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
            {description && (
                <Text fontSize="sm" mt={1} opacity={0.9}>
                    {description}
                </Text>
            )}
          </Flex>
        </Box>
      ),
    })
  }

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
        showCartToast("Обмежена кількість!", `На складі всього ${stockLimit} шт.`, "warning")
        return prevCart
      }

      // Якщо успішно додаємо - показуємо тост (тільки якщо це не зі сторінки товару, де свій тост)
      // Але оскільки функція addToCart викликається з різних місць, краще залишити тост тут, 
      // АБО прибрати його з компонентів. 
      // У твоєму випадку компоненти ProductCard і ProductPage ВЖЕ мають свої тости.
      // Щоб не дублювати, можна тут прибрати success тост, АБО залишити як резервний.
      // Я залишу success тост закоментованим, щоб не було подвійних повідомлень, 
      // оскільки ми додали красиві тости прямо в компоненти.
      
      // showCartToast("Додано в кошик", selectedOptions.length > 0 ? `+ ${selectedOptions.map(o => o.name).join(', ')}` : null, "success")

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
      // Використовуємо map, щоб пройтись по кошику і оновити потрібний елемент
      const newCart = prevCart.map((item) => {
        if (item.cartItemId === cartItemId) {
          const stockLimit = item.stockCount !== undefined ? item.stockCount : 999
          
          if (item.quantity + 1 > stockLimit) {
            showCartToast("Максимум на складі!", null, "warning")
            return item // Повертаємо item без змін
          }
          return { ...item, quantity: item.quantity + 1 }
        }
        return item
      })
      return newCart
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