
import { getProductsByProducer } from './products';
import { getCategoryImage, getProducerImage } from '../utils/imageUtils';

// Producer data
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
    get products() { return getProductsByProducer("Bucătăria Moldovenească"); }
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
    get products() { return getProductsByProducer("Casa Mare"); }
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
    get products() { return getProductsByProducer("La Cucina Italiana"); }
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
    get products() { return getProductsByProducer("Bistro Français"); }
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
    get products() { return getProductsByProducer("Sushi Time"); }
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
    get products() { return getProductsByProducer("Wok House"); }
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
    get products() { return getProductsByProducer("Sweet Corner"); }
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
    get products() { return getProductsByProducer("Coffee Point"); }
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
    get products() { return getProductsByProducer("Fresh Drinks"); }
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
    get products() { return getProductsByProducer("Wine Café"); }
  }
];

// Get producer by name
export const getProducerByName = (producerName) => {
  return producersData.find(producer => producer.producerName === producerName);
};
