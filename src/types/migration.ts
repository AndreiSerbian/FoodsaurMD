
export interface MigrationResult {
  success: boolean;
  message: string;
  details?: {
    migratedCount?: number;
    note?: string;
    errors?: string[];
  };
}

export interface ProducerMigrationData {
  producerName: string;
  category?: string;
  address?: string;
  phone?: string;
  discountAvailableTime?: string;
  producerImage?: {
    exterior?: string;
    interior?: string;
  };
  products?: Array<{
    productName: string;
    description?: string;
    priceRegular: number;
    priceDiscount?: number;
    image?: string;
    quantity?: number;
  }>;
}
