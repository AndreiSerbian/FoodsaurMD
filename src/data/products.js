
import { getProductImage } from '../utils/imageUtils';

// Products data
export const productsData = [
  // Moldavian cuisine - Bucătăria Moldovenească
  {
    productName: "Плацинда с брынзой",
    description: "Традиционный молдавский пирог с начинкой из брынзы.",
    priceRegular: 35,
    priceDiscount: 25,
    get image() { return getProductImage("placinta-with-brynza"); },
    producerName: "Bucătăria Moldovenească"
  },
  {
    productName: "Мамалыга с брынзой",
    description: "Традиционная молдавская кукурузная каша с брынзой и сметаной.",
    priceRegular: 45,
    priceDiscount: 30,
    get image() { return getProductImage("mamaliga-with-brynza"); },
    producerName: "Bucătăria Moldovenească"
  },
  {
    productName: "Сарма в виноградных листьях",
    description: "Голубцы в виноградных листьях с мясом и рисом.",
    priceRegular: 60,
    priceDiscount: 45,
    get image() { return getProductImage("sarma"); },
    producerName: "Bucătăria Moldovenească"
  },
  
  // Moldavian cuisine - Casa Mare
  {
    productName: "Зама",
    description: "Традиционный молдавский суп с курицей и домашней лапшой.",
    priceRegular: 40,
    priceDiscount: 30,
    get image() { return getProductImage("zama"); },
    producerName: "Casa Mare"
  },
  {
    productName: "Вертута с яблоками",
    description: "Молдавский рулет из тонкого теста с яблочной начинкой.",
    priceRegular: 30,
    priceDiscount: 20,
    get image() { return getProductImage("vertuta-with-apples"); },
    producerName: "Casa Mare"
  },
  
  // European cuisine - La Cucina Italiana
  {
    productName: "Пицца Маргарита",
    description: "Классическая итальянская пицца с томатами, моцареллой и базиликом.",
    priceRegular: 80,
    priceDiscount: 60,
    get image() { return getProductImage("pizza-margherita"); },
    producerName: "La Cucina Italiana"
  },
  {
    productName: "Паста Карбонара",
    description: "Спагетти с соусом из гуанчале, яиц, сыра пекорино романо и черного перца.",
    priceRegular: 70,
    priceDiscount: 55,
    get image() { return getProductImage("pasta-carbonara"); },
    producerName: "La Cucina Italiana"
  },
  
  // European cuisine - Bistro Français
  {
    productName: "Круассан с миндалем",
    description: "Классический французский круассан с миндальной начинкой.",
    priceRegular: 25,
    priceDiscount: 18,
    get image() { return getProductImage("almond-croissant"); },
    producerName: "Bistro Français"
  },
  {
    productName: "Киш Лорен",
    description: "Открытый пирог из песочного теста с начинкой из яиц, сливок, бекона и сыра.",
    priceRegular: 55,
    priceDiscount: 40,
    get image() { return getProductImage("quiche-lorraine"); },
    producerName: "Bistro Français"
  },
  
  // Panasian cuisine - Sushi Time
  {
    productName: "Филадельфия ролл",
    description: "Классический суши-ролл с лососем, сливочным сыром и авокадо.",
    priceRegular: 95,
    priceDiscount: 75,
    get image() { return getProductImage("sushi-roll"); },
    producerName: "Sushi Time"
  },
  {
    productName: "Мисо суп",
    description: "Традиционный японский суп из ферментированной соевой пасты с водорослями, тофу и зеленым луком.",
    priceRegular: 35,
    priceDiscount: 25,
    get image() { return getProductImage("miso-soup"); },
    producerName: "Sushi Time"
  },
  
  // Panasian cuisine - Wok House
  {
    productName: "Лапша с курицей",
    description: "Яичная лапша с курицей, овощами и соусом терияки.",
    priceRegular: 60,
    priceDiscount: 45,
    get image() { return getProductImage("chicken-noodles"); },
    producerName: "Wok House"
  },
  {
    productName: "Рис с морепродуктами",
    description: "Жареный рис с креветками, кальмарами и овощами.",
    priceRegular: 75,
    priceDiscount: 55,
    get image() { return getProductImage("seafood-rice"); },
    producerName: "Wok House"
  },
  
  // Desserts - Sweet Corner
  {
    productName: "Шоколадный брауни",
    description: "Классический американский шоколадный пирог с орехами.",
    priceRegular: 30,
    priceDiscount: 20,
    get image() { return getProductImage("chocolate-brownie"); },
    producerName: "Sweet Corner"
  },
  {
    productName: "Чизкейк",
    description: "Нежный сливочный десерт с ягодным топпингом.",
    priceRegular: 45,
    priceDiscount: 35,
    get image() { return getProductImage("cheesecake"); },
    producerName: "Sweet Corner"
  },
  
  // Desserts - Coffee Point
  {
    productName: "Тирамису",
    description: "Итальянский десерт на основе маскарпоне, печенья савоярди, пропитанного кофе и ликером.",
    priceRegular: 45,
    priceDiscount: 35,
    get image() { return getProductImage("tiramisu"); },
    producerName: "Coffee Point"
  },
  {
    productName: "Эклер",
    description: "Французский десерт из заварного теста с кремовой начинкой и шоколадной глазурью.",
    priceRegular: 25,
    priceDiscount: 18,
    get image() { return getProductImage("eclair"); },
    producerName: "Coffee Point"
  },
  
  // Drinks - Fresh Drinks
  {
    productName: "Смузи Ягодный",
    description: "Освежающий смузи из свежих ягод с бананом и йогуртом.",
    priceRegular: 40,
    priceDiscount: 30,
    get image() { return getProductImage("berry-smoothie"); },
    producerName: "Fresh Drinks"
  },
  {
    productName: "Лимонад",
    description: "Домашний лимонад из свежих цитрусовых и мяты.",
    priceRegular: 35,
    priceDiscount: 25,
    get image() { return getProductImage("lemonade"); },
    producerName: "Fresh Drinks"
  },
  
  // Drinks - Wine Café
  {
    productName: "Вино Красное",
    description: "Бокал молдавского красного вина из коллекции местных виноделен.",
    priceRegular: 50,
    priceDiscount: 35,
    get image() { return getProductImage("red-wine"); },
    producerName: "Wine Café"
  },
  {
    productName: "Вино Белое",
    description: "Бокал молдавского белого вина из коллекции местных виноделен.",
    priceRegular: 50,
    priceDiscount: 35,
    get image() { return getProductImage("white-wine"); },
    producerName: "Wine Café"
  }
];

// Get products by producer name
export const getProductsByProducer = (producerName) => {
  return productsData.filter(product => product.producerName === producerName);
};

// Get product by name
export const getProductByName = (productName) => {
  return productsData.find(product => product.productName === productName);
};
