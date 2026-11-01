import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: {
    heading: `'Montserrat', sans-serif`,
    body: `'Open Sans', sans-serif`,
  },
  colors: {
    brand: {
      green: "#2cbf5a",
      dark: "#000000",
      gray: "#f5f5f5",
      red: "#e74c3c"
    }
  },
  styles: {
    global: {
      "html, body": {
        color: "black",
      },
      "hr": {
        borderTopWidth: "3px !important",
        borderColor: "black !important",
        opacity: "1 !important",
      }
    }
  },
  components: {
    Divider: {
      baseStyle: {
        borderWidth: "0px",
        borderBottomWidth: "3px",
        borderStyle: "solid",
        borderColor: "black",
        opacity: 1,
      }
    },
    // КНОПКИ: Легке заокруглення (8px)
    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "8px", 
      },
      variants: {
        primary: {
          bg: "brand.green",
          color: "white",
          _hover: { bg: "#25a04b" }
        },
      }
    },
    // МЕНЮ (як ти вже затвердив)
    Menu: {
      baseStyle: {
        list: {
          border: "2px solid black",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.15)", // М'яка тінь
          bg: "white",
          borderRadius: "16px", // Заокруглене
        },
        item: {
          _focus: { bg: "gray.100" },
          _active: { bg: "gray.200" },
          borderRadius: "8px",  // Пункти теж
        }
      }
    },
    // ВИПАДАЮЧІ СПИСКИ
    Popover: {
      baseStyle: {
        content: {
          borderRadius: "16px",
          border: "2px solid black",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
        },
      }
    },
    // БОКОВЕ МЕНЮ (Кошик)
    Drawer: {
      baseStyle: {
        dialog: {
          borderTopLeftRadius: "16px",
          borderBottomLeftRadius: "16px",
          bg: "white",
        }
      }
    },
    // МОДАЛЬНІ ВІКНА
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: "20px",
          border: "2px solid black",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
        }
      }
    },
    // ПОЛЯ ВВОДУ
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: "8px", // Акуратні поля
            borderColor: "black",
            borderWidth: "2px",
            _focus: {
              borderColor: "brand.green",
              boxShadow: "none"
            }
          }
        }
      }
    },
    // КАРТКИ
    Card: {
      baseStyle: {
        container: {
          borderRadius: "16px",
        }
      }
    }
  }
})

export default theme