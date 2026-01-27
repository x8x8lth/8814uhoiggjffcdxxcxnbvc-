const API_KEY = "52d591130a3b5b14c3d12d036b7e743f"; // Можеш замінити на свій
const API_URL = "https://api.novaposhta.ua/v2.0/json/";

export const searchCity = async (cityName) => {
  const body = {
    apiKey: API_KEY,
    modelName: "Address",
    calledMethod: "searchSettlements",
    methodProperties: {
      CityName: cityName,
      Limit: "50",
      Page: "1"
    }
  };

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  if (data.success && data.data[0]) {
    // Нова Пошта повертає купу всього, нам треба тільки назви і Ref (ID міста)
    return data.data[0].Addresses.map(item => ({
      label: item.Present, // Наприклад "м. Київ, Київська обл."
      value: item.DeliveryCity // ID міста для пошуку відділень
    }));
  }
  return [];
};

export const getWarehouses = async (cityRef) => {
  const body = {
    apiKey: API_KEY,
    modelName: "Address",
    calledMethod: "getWarehouses",
    methodProperties: {
      CityRef: cityRef,
      Limit: "500",
      Language: "UA"
    }
  };

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (data.success) {
    return data.data.map(item => ({
      label: item.Description, // "Відділення №1: вул. ..."
      value: item.Description  // Зберігаємо назву
    }));
  }
  return [];
};