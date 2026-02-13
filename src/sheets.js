import Papa from 'papaparse'

// Посилання беруться з .env
const PRODUCTS_SHEET_URL = import.meta.env.VITE_PRODUCTS_SHEET_URL;
const BANNERS_SHEET_URL = import.meta.env.VITE_BANNERS_SHEET_URL;

export const fetchProducts = () => {
  return new Promise((resolve) => {
    if (!PRODUCTS_SHEET_URL) {
        console.error("Products sheet URL is missing in .env");
        resolve([]);
        return;
    }
    Papa.parse(PRODUCTS_SHEET_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validData = results.data
          .filter(row => row.id && row.name)
          .map(row => {
            const priceRaw = row.price ? row.price.toString().replace(/\s/g, '').replace(',', '.') : "0"
            const cleanPrice = parseFloat(priceRaw) || 0
            const oldPriceRaw = row.price_old ? row.price_old.toString().replace(/\s/g, '').replace(',', '.') : null
            const cleanOldPrice = oldPriceRaw ? parseFloat(oldPriceRaw) : null

            const points = parseInt(row.points) || 0
            const stockCount = row.quantity && row.quantity !== '-' ? parseInt(row.quantity) : 999

            let suffix = ""
            if (row.flavor) suffix = `(${row.flavor})`
            else if (row.color) suffix = `(${row.color})`
            
            const fullName = `${row.name} ${suffix}`.trim()
            const groupId = row.group_id || row['group_id'] || row.GroupId || row['Group ID'] || null

            return {
              id: row.id.toString().trim(),
              name: row.name,         
              fullName: fullName,     
              price: cleanPrice,    
              oldPrice: cleanOldPrice,
              points: points,
              stockCount: stockCount, 
              image: row.image,     
              category: row.category ? row.category.trim().toLowerCase() : "", 
              subcategory: row.subcategory,
              groupId: groupId,
              label: row.labels,    
              brand: row.brand,
              description: row.description,
              description_image: row.description_image, // 👇 ДОДАНО ОСЬ ЦЕЙ РЯДОК!
              inStock: row.inStock ? row.inStock.toLowerCase() !== 'false' : true,
              flavor: row.flavor,             
              color: row.color,               
              country: row.country,           
              tasteGroup: row.taste_group,    
              display: row.display,           
              material: row.material,         
              powerMode: row.power_mode,      
              controlType: row.control_type,  
              resistance: row.resistance,     
              volume: row.volume              
            }
          })
        resolve(validData)
      },
      error: (err) => {
        console.error("❌ ПОМИЛКА CSV:", err)
        resolve([]) 
      }
    })
  })
}

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