import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase'; // Підключаємо твою базу

import Papa from 'papaparse';

// Посилання на банери залишаємо з .env (вони поки живуть у таблиці)
const BANNERS_SHEET_URL = import.meta.env.VITE_BANNERS_SHEET_URL;

// 👇 НОВИЙ СУПЕР-ШВИДКИЙ FETCH З FIREBASE З ВІДНОВЛЕНОЮ ЛОГІКОЮ
export const fetchProducts = async () => {
  try {
    // Робимо запит до колекції "products" у Firebase
    const querySnapshot = await getDocs(collection(db, "products"));
    
    // Витягуємо дані і одразу "причісуємо" їх для сайту
    const validData = querySnapshot.docs.map(doc => {
      const row = doc.data();

      // Відновлюємо створення fullName (назва + смак або колір)
      let suffix = "";
      if (row.flavor) suffix = `(${row.flavor})`;
      else if (row.color) suffix = `(${row.color})`;
      
      const fullName = `${row.name || ''} ${suffix}`.trim();

      return {
        ...row, // беремо всі інші поля, що є в базі (ціна, бренд, опис тощо)
        id: String(doc.id).trim(), // беремо надійний ID з самого документа Firebase
        fullName: fullName,
        category: row.category ? row.category.trim().toLowerCase() : "",
        label: row.label || row.labels || "", // Повертаємо Топи і Новинки на головну!
        tasteGroup: row.tasteGroup || row.taste_group || "",
        groupId: row.groupId || row.group_id || row['Group ID'] || row.GroupId || null
      };
    });
    
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