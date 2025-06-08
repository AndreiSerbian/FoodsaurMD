
// Mock data for demonstration purposes
// In real app, this would come from Supabase

export interface Product {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  discountPrice?: number;
  quantity: number;
}

export interface Producer {
  id: string;
  producerName: string;
  categoryName: string;
  address: string;
  products: Product[];
  producerImage?: {
    exterior?: string;
    interior?: string;
  };
}

const mockProducers: Producer[] = [
  {
    id: "1",
    producerName: "Retro Bakery",
    categoryName: "Хлебобулочные изделия",
    address: "ул. Пушкина 15, Кишинёв",
    producerImage: {
      exterior: "/placeholder.svg",
      interior: "/placeholder.svg"
    },
    products: [
      {
        id: "1",
        name: "Хлеб белый",
        description: "Свежий белый хлеб",
        image: "/placeholder.svg",
        price: 8,
        discountPrice: 6,
        quantity: 10
      },
      {
        id: "2", 
        name: "Багет французский",
        description: "Хрустящий французский багет",
        image: "/placeholder.svg",
        price: 12,
        quantity: 5
      }
    ]
  }
];

export const getProducerByName = (name: string): Producer | null => {
  return mockProducers.find(producer => 
    producer.producerName.toLowerCase() === name.toLowerCase()
  ) || null;
};

export const getAllProducers = (): Producer[] => {
  return mockProducers;
};
