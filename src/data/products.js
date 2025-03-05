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
        exterior: getProducerImage("bistro-frances", "exterior"),
        interior: getProducerImage("bistro-frances", "interior")
      };
    },
    discountAvailableTime: "с 16:00 до 19:00",
    products: [
      {
        productName: "Киш Лорен",
        get image() { return getProductImage("kish-loren"); },
        priceRegular: 95,
        priceDiscount: 85,
        description: "Французский открытый пирог с хрустящим тес��ом и начинкой из яиц, сливок и бекона."
      },
      {
        productName: "Круассан",
        get image() { return getProductImage("kruassan"); },
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
        get image() { return getProductImage("filadelfia-roll"); },
        priceRegular: 150,
        priceDiscount: 130,
        description: "Популярные роллы с нежным лососем, сливочным сыром и авокадо."
      },
      {
        productName: "Сяке маки",
        get image() { return getProductImage("sake-maki"); },
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
        get image() { return getProductImage("ramen-lash"); },
        priceRegular: 140,
        priceDiscount: 120,
        description: "Пряный бульон с яичной лапшой, говядиной, яйцом и овощами."
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
        get image() { return getProductImage("chickie-kake-new-york"); },
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
        get image() { return getProductImage("kruassan"); },
        priceRegular: 40,
        priceDiscount: 25,
        description: "Воздушный французский круассан с хрустящей корочкой."
      },
      {
        productName: "Капучино",
        get image() { return getProductImage("capuchino"); },
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
        get image() { return getProductImage("fresh-orange"); },
        priceRegular: 35,
        priceDiscount: 30,
        description: "Свежевыжатый апельсиновый сок без добавления сахара."
      },
      {
        productName: "Кофе Латте",
        get image() { return getProductImage("latte-coffee"); },
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
        get image() { return getProductImage("savinon-blanc-new-zealand"); },
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
