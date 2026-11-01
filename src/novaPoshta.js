// Ключ береться з .env
const API_KEY = import.meta.env.VITE_NOVA_POSHTA_API_KEY; 
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
    return data.data[0].Addresses.map(item => ({
      label: item.Present, 
      value: item.DeliveryCity 
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
      label: item.Description, 
      value: item.Description 
    }));
  }
  return [];
};