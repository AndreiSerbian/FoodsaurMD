
// Оставляем только Retro Bakery как основной верифицированный производитель
export const producersData = [
  {
    id: 1,
    producerName: "Retro Bakery",
    producerSlug: "retro-bakery",
    category: "Десерты",
    address: "Центр, ул. Штефан чел Маре 123",
    phone: "+373 22 123 456",
    discountAvailableTime: "Пн-Пт: 14:00-16:00",
    producerImage: {
      exterior: "/src/assets/Images/producers/retro-bakery-exterior.jpg",
      interior: "/src/assets/Images/producers/retro-bakery-interior.jpg"
    },
    products: [
      {
        id: 1,
        productName: "Круассан классический",
        description: "Свежий круассан из слоёного теста с маслом",
        priceRegular: 25,
        priceDiscount: 20,
        image: "/src/assets/Images/products/croissant.jpg",
        quantity: 15
      },
      {
        id: 2,
        productName: "Круассан с шоколадом",
        description: "Круассан с шоколадной начинкой",
        priceRegular: 30,
        priceDiscount: 25,
        image: "/src/assets/Images/products/croissant-2.jpg",
        quantity: 10
      },
      {
        id: 3,
        productName: "Нью-Йорк чизкейк",
        description: "Классический американский чизкейк",
        priceRegular: 85,
        priceDiscount: 70,
        image: "/src/assets/Images/products/new-york-cheesecake.jpg",
        quantity: 5
      },
      {
        id: 4,
        productName: "Макарон ассорти",
        description: "Набор французских макарон разных вкусов",
        priceRegular: 120,
        priceDiscount: 100,
        image: "/src/assets/Images/products/macaron.jpg",
        quantity: 8
      }
    ]
  }
];
