import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from './firebase';

export const fetchProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    
    const validData = querySnapshot.docs.map(doc => {
      const row = doc.data();

      let suffix = "";
      if (row.flavor) suffix = `(${row.flavor})`;
      else if (row.color) suffix = `(${row.color})`;
      
      const fullName = `${row.name || ''} ${suffix}`.trim();

      return {
        ...row,
        id: String(doc.id).trim(),
        fullName: fullName,
        category: row.category ? row.category.trim().toLowerCase() : "",
        label: row.label || row.labels || "",
        tasteGroup: row.tasteGroup || row.taste_group || "",
        groupId: row.groupId || row.group_id || row['Group ID'] || row.GroupId || null
      };
    });
    
    return validData;
  } catch (error) {
    return [];
  }
};

export const fetchBanners = async () => {
  try {
    const q = query(collection(db, "banners"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    return [];
  }
};