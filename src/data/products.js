
export const producersData = [
  {
    "categoryName": "Молдавская",
    "categoryImage": "/lovable-uploads/7c3e90f4-67d1-486c-9127-d445b9d67277.png",
    "producerName": "Bucătăria Moldovenească",
    "address": "ул. Штефан чел Маре 45, Кишинёв",
    "producerImage": {
      "exterior": "/lovable-uploads/299fa24e-7a4a-4d37-b2da-545e7d217f25.png",
      "interior": "/lovable-uploads/802c1aa1-033f-49b5-ad18-7ba95b4725f0.png"
    },
    "discountAvailableTime": "с 18:00 до 21:00",
    "products": [
      {
        "productName": "Плацинда с брынзой",
        "image": "/placeholder.svg",
        "priceRegular": 50,
        "priceDiscount": 40,
        "description": "Традиционная молдавская выпечка с брынзой, хрустящая снаружи и нежная внутри."
      },
      {
        "productName": "Мамалыга с брынзой",
        "image": "/placeholder.svg",
        "priceRegular": 60,
        "priceDiscount": 55,
        "description": "Классическая кукурузная каша с добавлением брынзы, идеально сочетается с молочными продуктами."
      }
    ]
  },
  {
    "categoryName": "Европейская",
    "categoryImage": "/placeholder.svg",
    "producerName": "La Cucina Italiana",
    "address": "ул. Роз 23, Кишинёв",
    "producerImage": {
      "exterior": "/placeholder.svg",
      "interior": "/placeholder.svg"
    },
    "discountAvailableTime": "с 17:00 до 20:00",
    "products": [
      {
        "productName": "Пицца Маргарита",
        "image": "/placeholder.svg",
        "priceRegular": 120,
        "priceDiscount": 100,
        "description": "Классическая итальянская пицца с томатным соусом, моцареллой и свежим базиликом."
      },
      {
        "productName": "Паста Карбонара",
        "image": "/placeholder.svg",
        "priceRegular": 110,
        "priceDiscount": 90,
        "description": "Традиционная паста с беконом, яичным соусом и пармезаном."
      }
    ]
  },
  {
    "categoryName": "Паназиатская",
    "categoryImage": "/placeholder.svg",
    "producerName": "Sushi Time",
    "address": "ул. Вероники 17, Кишинёв",
    "producerImage": {
      "exterior": "/placeholder.svg",
      "interior": "/placeholder.svg"
    },
    "discountAvailableTime": "с 19:00 до 22:00",
    "products": [
      {
        "productName": "Филадельфия ролл",
        "image": "/placeholder.svg",
        "priceRegular": 150,
        "priceDiscount": 130,
        "description": "Роллы с лососем, сливочным сыром и авокадо, завернутые в нори и рис."
      },
      {
        "productName": "Сяке маки",
        "image": "/placeholder.svg",
        "priceRegular": 90,
        "priceDiscount": 75,
        "description": "Классические роллы с лососем, обернутые в нори."
      }
    ]
  },
  {
    "categoryName": "Напитки",
    "categoryImage": "/placeholder.svg",
    "producerName": "Wine Café",
    "address": "ул. Киевская 16, Кишинёв",
    "producerImage": {
      "exterior": "/placeholder.svg",
      "interior": "/placeholder.svg"
    },
    "discountAvailableTime": "с 20:00 до 23:00",
    "products": [
      {
        "productName": "Совиньон Блан (Новая Зеландия)",
        "image": "/placeholder.svg",
        "priceRegular": 120,
        "priceDiscount": 110,
        "description": "Освежающее белое вино с цитрусовыми нотками и легким послевкусием."
      },
      {
        "productName": "Арманьяк (Франция)",
        "image": "/placeholder.svg",
        "priceRegular": 250,
        "priceDiscount": 230,
        "description": "Французский крепкий напиток с насыщенным вкусом и ароматом выдержанного дуба."
      }
    ]
  }
];

// Extract unique categories
export const categories = [...new Set(producersData.map(producer => producer.categoryName))];

// Get producers by category
export const getProducersByCategory = (categoryName) => {
  return producersData.filter(producer => producer.categoryName === categoryName);
};

// Get producer by name
export const getProducerByName = (producerName) => {
  return producersData.find(producer => producer.producerName === producerName);
};

// Get product by name from a specific producer
export const getProductByName = (producerName, productName) => {
  const producer = getProducerByName(producerName);
  if (!producer) return null;
  return producer.products.find(product => product.productName === productName);
};
