import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase'; // Підключаємо твою базу з файлу firebase.js

import Papa from 'papaparse';

// Посилання на банери залишаємо з .env (вони поки живуть у таблиці)
const BANNERS_SHEET_URL = import.meta.env.VITE_BANNERS_SHEET_URL;

// 👇 НОВИЙ СУПЕР-ШВИДКИЙ FETCH З FIREBASE
export const fetchProducts = async () => {
  try {
    // Робимо запит до колекції "products" у Firebase
    const querySnapshot = await getDocs(collection(db, "products"));
    
    // Витягуємо дані з кожного документа і формуємо готовий масив
    const validData = querySnapshot.docs.map(doc => doc.data());
    
    return validData;
  } catch (error) {
    console.error("❌ ПОМИЛКА FIREBASE:", error);
    return [];
  }
};

// 👇 БАНЕРИ ПОКИ ЗАЛИШАЄМО НА ГУГЛ ТАБЛИЦЯХ
export const fetchBanners = () => {
  return new Promise((resolve) => {
    if (!BANNERS_SHEET_URL) { resolve([]); return; }
    Papa.parse(BANNERS_SHEET_URL, {
      download: true, header: true,
      complete: (results) => {
        const validBanners = results.data.filter(row => row.image).map(row => ({
            id: row.id, image: row.image, link: row.link || '/category/sales'
        }))
        resolve(validBanners)
      },
      error: () => resolve([])
    })
  })
}