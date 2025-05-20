import { getCategoryImage, getProducerImage, getProductImage } from '../utils/imageUtils';

export const producersData = [
  {
    categoryName: "Молдавская",
    get categoryImage() { return getCategoryImage("moldavian"); },
    producerName: "Bucătăria Moldovenească",
    address: "ул. Штефан чел Маре 45, Кишинёв",
    get producerImage() { 
      return {
        exterior: getProducerImage("bucataria-moldoveneasca", "exterior"),
        interior: getProducerImage("bucataria-moldoveneasca", "interior")
      };
    },
    discountAvailableTime: "с 18:00 до 21:00",
    products: [
      {
        productName: "Плацинда с брынзой",
        get image() { return getProductImage("placinta-with-brynza"); },
        priceRegular: 50,
        priceDiscount: 40,
        description: "Традиционная молдавская выпечка с брынзой, хрустящая снаружи и нежная внутри."
      },
      {
        productName: "Мамалыга с брынзой",
        get image() { return getProductImage("mamaliga-with-brynza"); },
        priceRegular: 60,
        priceDiscount: 55,
        description: "Классическая молдавская кукурузная каша, подаётся с брынзой и сметаной."
      }
    ]
  },
  {
    categoryName: "Молдавская",
    get categoryImage() { return getCategoryImage("moldavian"); },
    producerName: "Casa Mare",
    address: "ул. Пушкина 12, Бельцы",
    get producerImage() { 
      return {
        exterior: getProducerImage("casa-mare", "exterior"),
        interior: getProducerImage("casa-mare", "interior")
      };
    },
    discountAvailableTime: "с 17:00 до 20:00",
    products: [
      {
        productName: "Сарма",
        get image() { return getProductImage("sarma"); },
        priceRegular: 70,
        priceDiscount: 65,
        description: "Молдавские голубцы, приготовленные с мясным фаршем, рисом и специями, завернутые в капустные листья."
      },
      {
        productName: "Зама",
        get image() { return getProductImage("zama"); },
        priceRegular: 55,
        priceDiscount: 50,
        description: "Традиционный молдавский куриный суп с домашней лапшой и зеленью."
      }
    ]
  },
  {
    categoryName: "Европейская",
    get categoryImage() { return getCategoryImage("european"); },
    producerName: "La Cucina Italiana",
    address: "ул. Роз 23, Кишинёв",
    get producerImage() { 
      return {
        exterior: getProducerImage("la-cucina-italiana", "exterior"),
        interior: getProducerImage("la-cucina-italiana", "interior")
      };
    },
    discountAvailableTime: "с 17:00 до 20:00",
    products: [
      {
        productName: "Пицца Маргарита",
        get image() { return getProductImage("pizza-margherita"); },
        priceRegular: 120,
        priceDiscount: 100,
        description: "Классическая итальянская пицца с томатным соусом, моцареллой и свежим базиликом."
      },
      {
        productName: "Паста Карбонара",
        get image() { return getProductImage("pasta-carbonara"); },
        priceRegular: 110,
        priceDiscount: 90,
        description: "Паста с беконом, пармезаном и соусом на основе яиц и сливок."
      }
    ]
  },
  {
    categoryName: "Европейская",
    get categoryImage() { return getCategoryImage("european"); },
    producerName: "Bistro Français",
    address: "ул. Эминеску 9, Кагул",
    get producerImage() { 
      return {
        exterior: getProducerImage("bistro-francais", "exterior"),
        interior: getProducerImage("bistro-francais", "interior")
      };
    },
    discountAvailableTime: "с 16:00 до 19:00",
    products: [
      {
        productName: "Киш Лорен",
        get image() { return getProductImage("quiche-lorraine"); },
        priceRegular: 95,
        priceDiscount: 85,
        description: "Французский открытый пирог с хрустящим тестом и начинкой из яиц, сливок и бекона."
      },
      {
        productName: "Круассан",
        get image() { return getProductImage("croissant"); },
        priceRegular: 40,
        priceDiscount: 35,
        description: "Классический французский слойный круассан с хрустящей корочкой и нежным тестом."
      }
    ]
  },
  {
    categoryName: "Паназиатская",
    get categoryImage() { return getCategoryImage("panasian"); },
    producerName: "Sushi Time",
    address: "ул. Вероники 17, Кишинёв",
    get producerImage() { 
      return {
        exterior: getProducerImage("sushi-time", "exterior"),
        interior: getProducerImage("sushi-time", "interior")
      };
    },
    discountAvailableTime: "с 19:00 до 22:00",
    products: [
      {
        productName: "Филадельфия ролл",
        get image() { return getProductImage("philadelphia-roll"); },
        priceRegular: 150,
        priceDiscount: 130,
        description: "Популярные роллы с нежным лососем, сливочным сыром и авокадо."
      },
      {
        productName: "Сяке маки",
        get image() { return getProductImage("salmon-maki"); },
        priceRegular: 90,
        priceDiscount: 75,
        description: "Классические японские роллы с лососем, рисом и нори."
      }
    ]
  },
  {
    categoryName: "Паназиатская",
    get categoryImage() { return getCategoryImage("panasian"); },
    producerName: "Wok House",
    address: "ул. Каля Басарабяска 3, Бельцы",
    get producerImage() { 
      return {
        exterior: getProducerImage("wok-house", "exterior"),
        interior: getProducerImage("wok-house", "interior")
      };
    },
    discountAvailableTime: "с 20:00 до 23:00",
    products: [
      {
        productName: "Удон с курицей",
        get image() { return getProductImage("udon-with-chicken"); },
        priceRegular: 130,
        priceDiscount: 110,
        description: "Японская лапша удон с жареной курицей, овощами и соевым соусом."
      },
      {
        productName: "Лапша Рамен",
        get image() { return getProductImage("ramen"); },
        priceRegular: 140,
        priceDiscount: 120,
        description: "Пряный бульон с яичной лапшой, говядиной, яйцом и овощами."
      }
    ]
  },
  {
    categoryName: "Десерты",
    get categoryImage() { return getCategoryImage("desserts"); },
    producerName: "Retro Bakery",
    address: "ул. Василя Лупу 31а, Кишинев",
    get producerImage() { 
      return {
        exterior: getProducerImage("retro-bakery", "exterior"),
        interior: getProducerImage("retro-bakery", "interior"),
        logo: getProducerImage("retro-bakery", "logo")
      };
    },
    discountAvailableTime: "с 17:00 до 19:30",
    products: [
      {
        productName: "Саралии с творогом и зеленью",
        get image() { return getProductImage("saralii_branza_verdeata"); },
        priceRegular: 26,
        priceDiscount: 24,
        description: "Слоеная выпечка с начинкой из творога и свежей зелени."
      },
      {
        productName: "Печенье 'Олимпийский мишка'",
        get image() { return getProductImage("ursulet_olimpic"); },
        priceRegular: 27,
        priceDiscount: 25,
        description: "Печенье в форме мишки, любимое лакомство из детства."
      },
      {
        productName: "Рогалики с вишней",
        get image() { return getProductImage("cornulete_visina"); },
        priceRegular: 110,
        priceDiscount: 100,
        description: "Хрустящие рогалики с кисло-сладкой начинкой из вишни."
      },
      {
        productName: "Пирог с вишней в собственном соку",
        get image() { return getProductImage("invartita_visina_suc_propriu"); },
        priceRegular: 29,
        priceDiscount: 27,
        description: "Сдобный пирог с сочной вишневой начинкой."
      },
      {
        productName: "Баба Негра по-северному",
        get image() { return getProductImage("baba_neagra_nord"); },
        priceRegular: 290,
        priceDiscount: 270,
        description: "Традиционный молдавский десерт с насыщенным вкусом и влажной текстурой."
      },
      {
        productName: "Печенье 'Молдова' с вишней",
        get image() { return getProductImage("biscuiti_moldova_visina"); },
        priceRegular: 9,
        priceDiscount: 8,
        description: "Печенье с хрустящей корочкой и начинкой из вишни."
      },
      {
        productName: "Сосиска 'Ковридог'",
        get image() { return getProductImage("crenvusti_aluat_covridog"); },
        priceRegular: 22,
        priceDiscount: 20,
        description: "Сосиска в тесте в стиле коврига — с хрустящей коркой."
      },
      {
        productName: "Домашний хлеб на закваске с хмелем и белой мукой",
        get image() { return getProductImage("paine_maia_hamei_faina_alba"); },
        priceRegular: 79,
        priceDiscount: 75,
        description: "Хлеб ручной работы с натуральной закваской и хмелем."
      },
      {
        productName: "Пирожок с мясом (говядина и свинина)",
        get image() { return getProductImage("pateu_vita_porc_beleas"); },
        priceRegular: 29,
        priceDiscount: 27,
        description: "Сытный пирожок с начинкой из говядины и свинины."
      },
      {
        productName: "Жареная лепёшка с творогом и зеленью",
        get image() { return getProductImage("placinta_prajita_branza_verdeata"); },
        priceRegular: 29,
        priceDiscount: 27,
        description: "Классическая молдавская плацинда с творогом и зеленью."
      },
      {
        productName: "Ржаной хлеб с солодом и ячменем",
        get image() { return getProductImage("paine_secara_malt_orz"); },
        priceRegular: 89,
        priceDiscount: 85,
        description: "Ароматный хлеб с насыщенным вкусом ржи, солода и ячменя."
      }
    ]
  },
  {
    categoryName: "Десерты",
    get categoryImage() { return getCategoryImage("desserts"); },
    producerName: "Sweet Corner",
    address: "ул. Дачия 50, Кишинёв",
    get producerImage() { 
      return {
        exterior: getProducerImage("sweet-corner", "exterior"),
        interior: getProducerImage("sweet-corner", "interior")
      };
    },
    discountAvailableTime: "с 18:00 до 21:00",
    products: [
      {
        productName: "Чизкейк Нью-Йорк",
        get image() { return getProductImage("new-york-cheesecake"); },
        priceRegular: 80,
        priceDiscount: 70,
        description: "Классический американский чизкейк с нежной текстурой и сливочным вкусом."
      },
      {
        productName: "Макарон",
        get image() { return getProductImage("macaron"); },
        priceRegular: 45,
        priceDiscount: 40,
        description: "Французские миндальные пирожные с различными вкусами."
      }
    ]
  },
  {
    categoryName: "Десерты",
    get categoryImage() { return getCategoryImage("desserts"); },
    producerName: "Coffee Point",
    address: "ул. Когэлничану 32, Кишинёв",
    get producerImage() { 
      return {
        exterior: getProducerImage("coffee-point", "exterior"),
        interior: getProducerImage("coffee-point", "interior")
      };
    },
    discountAvailableTime: "с 17:00 до 20:00",
    products: [
      {
        productName: "Круассан",
        get image() { return getProductImage("croissant-2"); },
        priceRegular: 40,
        priceDiscount: 25,
        description: "Воздушный французский круассан с хрустящей корочкой."
      },
      {
        productName: "Капучино",
        get image() { return getProductImage("cappuccino"); },
        priceRegular: 45,
        priceDiscount: 20,
        description: "Ароматный итальянский капучино с молочной пеной."
      }
    ]
  },
  {
    categoryName: "Напитки",
    get categoryImage() { return getCategoryImage("drinks"); },
    producerName: "Fresh Drinks",
    address: "ул. Александри 21, Кагул",
    get producerImage() { 
      return {
        exterior: getProducerImage("fresh-drinks", "exterior"),
        interior: getProducerImage("fresh-drinks", "interior")
      };
    },
    discountAvailableTime: "с 15:00 до 18:00",
    products: [
      {
        productName: "Фреш апельсиновый",
        get image() { return getProductImage("fresh-orange-juice"); },
        priceRegular: 35,
        priceDiscount: 30,
        description: "Свежевыжатый апельсиновый сок без добавления сахара."
      },
      {
        productName: "Кофе Латте",
        get image() { return getProductImage("latte"); },
        priceRegular: 50,
        priceDiscount: 45,
        description: "Нежный кофейный напиток с молоком и легкой пенкой."
      }
    ]
  },
  {
    categoryName: "Напитки",
    get categoryImage() { return getCategoryImage("drinks"); },
    producerName: "Wine Café",
    address: "ул. Киевская 16, Кишинёв",
    get producerImage() { 
      return {
        exterior: getProducerImage("wine-cafe", "exterior"),
        interior: getProducerImage("wine-cafe", "interior")
      };
    },
    discountAvailableTime: "с 20:00 до 23:00",
    products: [
      {
        productName: "Совиньон Блан (Новая Зеландия)",
        get image() { return getProductImage("sauvignon-blanc-new-zealand"); },
        priceRegular: 120,
        priceDiscount: 110,
        description: "Освежающее белое вино с цитрусовыми нотками и легким послевкусием."
      },
      {
        productName: "Арманьяк (Франция)",
        get image() { return getProductImage("armagnac-france"); },
        priceRegular: 250,
        priceDiscount: 230,
        description: "Французский крепкий напиток с насыщенным вкусом и ароматом выдержанного дуба."
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

// Функция для обновления продукта производителя
export const updateProduct = (producerName, productName, updatedProduct) => {
  const producer = getProducerByName(producerName);
  if (!producer) return null;
  
  const productIndex = producer.products.findIndex(p => p.productName === productName);
  if (productIndex === -1) return null;
  
  producer.products[productIndex] = { ...producer.products[productIndex], ...updatedProduct };
  return producer.products[productIndex];
};

// Функция для добавления нового продукта производителю
export const addProduct = (producerName, newProduct) => {
  const producer = getProducerByName(producerName);
  if (!producer) return null;
  
  producer.products.push(newProduct);
  return newProduct;
};

// Функция для удаления продукта у производителя
export const deleteProduct = (producerName, productName) => {
  const producer = getProducerByName(producerName);
  if (!producer) return false;
  
  const initialLength = producer.products.length;
  producer.products = producer.products.filter(p => p.productName !== productName);
  
  return producer.products.length < initialLength;
};

// Функция для обновления информации о скидках производителя
export const updateProducerDiscountTime = (producerName, discountTime) => {
  const producer = getProducerByName(producerName);
  if (!producer) return null;
  
  producer.discountAvailableTime = discountTime;
  return producer;
};

// Мок базы данных для аутентификации производителей
export const producerCredentials = [
  {
    username: "retro-bakery",
    password: "password123", // В реальном приложении пароли должны быть хешированы
    producerName: "Retro Bakery"
  },
  {
    username: "sweet-corner",
    password: "password123",
    producerName: "Sweet Corner"
  }
];
