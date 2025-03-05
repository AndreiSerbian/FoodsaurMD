
import { getCategoryImage, getProducerImage, getProductImage } from '../utils/imageUtils';

export const producersData = [
  {
    categoryName: "Молдавская",
    categoryImage: "src/assets/Images/categories/moldavian.jpg",
    producerName: "Bucătăria Moldovenească",
    address: "ул. Штефан чел Маре 45, Кишинёв",
    producerImage: {
      exterior: "src/assets/Images/producers/bucataria-moldoveneasca-exterior.jpg",
      interior: "src/assets/Images/producers/bucataria-moldoveneasca-interior.jpg"
    },
    discountAvailableTime: "с 18:00 до 21:00",
    products: [
      {
        productName: "Плацинда с брынзой",
        image: "src/assets/Images/products/placinta-with-brynza.jpg",
        priceRegular: 50,
        priceDiscount: 40,
        description: "Традиционная молдавская выпечка с брынзой, хрустящая снаружи и нежная внутри."
      },
      {
        productName: "Мамалыга с брынзой",
        image: "src/assets/Images/products/mamaliga-with-brynza.jpg",
        priceRegular: 60,
        priceDiscount: 55,
        description: "Классическая молдавская кукурузная каша, подаётся с брынзой и сметаной."
      }
    ]
  },
  {
    categoryName: "Молдавская",
    categoryImage: "src/assets/Images/categories/moldavian.jpg",
    producerName: "Casa Mare",
    address: "ул. Пушкина 12, Бельцы",
    producerImage: {
      exterior: "src/assets/Images/producers/casa-mare-exterior.jpg",
      interior: "src/assets/Images/producers/casa-mare-interior.jpg"
    },
    discountAvailableTime: "с 17:00 до 20:00",
    products: [
      {
        productName: "Сарма",
        image: "src/assets/Images/products/sarma.jpg",
        priceRegular: 70,
        priceDiscount: 65,
        description: "Молдавские голубцы, приготовленные с мясным фаршем, рисом и специями, завернутые в капустные листья."
      },
      {
        productName: "Зама",
        image: "src/assets/Images/products/zama.jpg",
        priceRegular: 55,
        priceDiscount: 50,
        description: "Традиционный молдавский куриный суп с домашней лапшой и зеленью."
      }
    ]
  },
  {
    categoryName: "Европейская",
    categoryImage: "src/assets/Images/categories/european.jpg",
    producerName: "La Cucina Italiana",
    address: "ул. Роз 23, Кишинёв",
    producerImage: {
      exterior: "src/assets/Images/producers/la-cucina-italiana-exterior.jpg",
      interior: "src/assets/Images/producers/la-cucina-italiana-interior.jpg"
    },
    discountAvailableTime: "с 17:00 до 20:00",
    products: [
      {
        productName: "Пицца Маргарита",
        image: "src/assets/Images/products/pizza-margherita.jpg",
        priceRegular: 120,
        priceDiscount: 100,
        description: "Классическая итальянская пицца с томатным соусом, моцареллой и свежим базиликом."
      },
      {
        productName: "Паста Карбонара",
        image: "src/assets/Images/products/pasta-carbonara.jpg",
        priceRegular: 110,
        priceDiscount: 90,
        description: "Паста с беконом, пармезаном и соусом на основе яиц и сливок."
      }
    ]
  },
  {
    categoryName: "Европейская",
    categoryImage: "src/assets/Images/categories/european.jpg",
    producerName: "Bistro Français",
    address: "ул. Эминеску 9, Кагул",
    producerImage: {
      exterior: "src/assets/Images/producers/bistro-francais-exterior.jpg",
      interior: "src/assets/Images/producers/bistro-francais-interior.jpg"
    },
    discountAvailableTime: "с 16:00 до 19:00",
    products: [
      {
        productName: "Киш Лорен",
        image: "src/assets/Images/products/quiche-lorraine.jpg",
        priceRegular: 95,
        priceDiscount: 85,
        description: "Французский открытый пирог с хрустящим тестом и начинкой из яиц, сливок и бекона."
      },
      {
        productName: "Круассан",
        image: "src/assets/Images/products/croissant.jpg",
        priceRegular: 40,
        priceDiscount: 35,
        description: "Классический французский слойный круассан с хрустящей корочкой и нежным тестом."
      }
    ]
  },
  {
    categoryName: "Паназиатская",
    categoryImage: "src/assets/Images/categories/panasian.jpg",
    producerName: "Sushi Time",
    address: "ул. Вероники 17, Кишинёв",
    producerImage: {
      exterior: "src/assets/Images/producers/sushi-time-exterior.jpg",
      interior: "src/assets/Images/producers/sushi-time-interior.jpg"
    },
    discountAvailableTime: "с 19:00 до 22:00",
    products: [
      {
        productName: "Филадельфия ролл",
        image: "src/assets/Images/products/philadelphia-roll.jpg",
        priceRegular: 150,
        priceDiscount: 130,
        description: "Популярные роллы с нежным лососем, сливочным сыром и авокадо."
      },
      {
        productName: "Сяке маки",
        image: "src/assets/Images/products/salmon-maki.jpg",
        priceRegular: 90,
        priceDiscount: 75,
        description: "Классические японские роллы с лососем, рисом и нори."
      }
    ]
  },
  {
    categoryName: "Паназиатская",
    categoryImage: "src/assets/Images/categories/panasian.jpg",
    producerName: "Wok House",
    address: "ул. Каля Басарабяска 3, Бельцы",
    producerImage: {
      exterior: "src/assets/Images/producers/wok-house-exterior.jpg",
      interior: "src/assets/Images/producers/wok-house-interior.jpg"
    },
    discountAvailableTime: "с 20:00 до 23:00",
    products: [
      {
        productName: "Удон с курицей",
        image: "src/assets/Images/products/udon-with-chicken.jpg",
        priceRegular: 130,
        priceDiscount: 110,
        description: "Японская лапша удон с жареной курицей, овощами и соевым соусом."
      },
      {
        productName: "Лапша Рамен",
        image: "src/assets/Images/products/ramen.jpg",
        priceRegular: 140,
        priceDiscount: 120,
        description: "Пряный бульон с яичной лапшой, говядиной, яйцом и овощами."
      }
    ]
  },
  {
    categoryName: "Десерты",
    categoryImage: "src/assets/Images/categories/desserts.jpg",
    producerName: "Sweet Corner",
    address: "ул. Дачия 50, Кишинёв",
    producerImage: {
      exterior: "src/assets/Images/producers/sweet-corner-exterior.jpg",
      interior: "src/assets/Images/producers/sweet-corner-interior.jpg"
    },
    discountAvailableTime: "с 18:00 до 21:00",
    products: [
      {
        productName: "Чизкейк Нью-Йорк",
        image: "src/assets/Images/products/new-york-cheesecake.jpg",
        priceRegular: 80,
        priceDiscount: 70,
        description: "Классический американский чизкейк с нежной текстурой и сливочным вкусом."
      },
      {
        productName: "Макарон",
        image: "src/assets/Images/products/macaron.jpg",
        priceRegular: 45,
        priceDiscount: 40,
        description: "Французские миндальные пирожные с различными вкусами."
      }
    ]
  },
  {
    categoryName: "Десерты",
    categoryImage: "src/assets/Images/categories/desserts.jpg",
    producerName: "Coffee Point",
    address: "ул. Когэлничану 32, Кишинёв",
    producerImage: {
      exterior: "src/assets/Images/producers/coffee-point-exterior.jpg",
      interior: "src/assets/Images/producers/coffee-point-interior.jpg"
    },
    discountAvailableTime: "с 17:00 до 20:00",
    products: [
      {
        productName: "Круассан",
        image: "src/assets/Images/products/croissant-2.jpg",
        priceRegular: 40,
        priceDiscount: 25,
        description: "Воздушный французский круассан с хрустящей корочкой."
      },
      {
        productName: "Капучино",
        image: "src/assets/Images/products/cappuccino.jpg",
        priceRegular: 45,
        priceDiscount: 20,
        description: "Ароматный итальянский капучино с молочной пеной."
      }
    ]
  },
  {
    categoryName: "Напитки",
    categoryImage: "src/assets/Images/categories/drinks.jpg",
    producerName: "Fresh Drinks",
    address: "ул. Александри 21, Кагул",
    producerImage: {
      exterior: "src/assets/Images/producers/fresh-drinks-exterior.jpg",
      interior: "src/assets/Images/producers/fresh-drinks-interior.jpg"
    },
    discountAvailableTime: "с 15:00 до 18:00",
    products: [
      {
        productName: "Фреш апельсиновый",
        image: "src/assets/Images/products/fresh-orange-juice.jpg",
        priceRegular: 35,
        priceDiscount: 30,
        description: "Свежевыжатый апельсиновый сок без добавления сахара."
      },
      {
        productName: "Кофе Латте",
        image: "src/assets/Images/products/latte.jpg",
        priceRegular: 50,
        priceDiscount: 45,
        description: "Нежный кофейный напиток с молоком и легкой пенкой."
      }
    ]
  },
  {
    categoryName: "Напитки",
    categoryImage: "src/assets/Images/categories/drinks.jpg",
    producerName: "Wine Café",
    address: "ул. Киевская 16, Кишинёв",
    producerImage: {
      exterior: "src/assets/Images/producers/wine-cafe-exterior.jpg",
      interior: "src/assets/Images/producers/wine-cafe-interior.jpg"
    },
    discountAvailableTime: "с 20:00 до 23:00",
    products: [
      {
        productName: "Совиньон Блан (Новая Зеландия)",
        image: "src/assets/Images/products/sauvignon-blanc-new-zealand.jpg",
        priceRegular: 120,
        priceDiscount: 110,
        description: "Освежающее белое вино с цитрусовыми нотками и легким послевкусием."
      },
      {
        productName: "Арманьяк (Франция)",
        image: "src/assets/Images/products/armagnac-france.jpg",
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
