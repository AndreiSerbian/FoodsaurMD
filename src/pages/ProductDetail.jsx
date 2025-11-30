import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertTriangle, List, ShoppingCart, Maximize2, Home, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProductImages } from '@/hooks/useProductImages';
import { useCart } from '@/contexts/CartContext';
import { getCurrencySymbol } from '@/utils/unitUtils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { toast } from 'sonner';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const ProductDetail = () => {
  const { producerSlug, productId } = useParams();
  const [searchParams] = useSearchParams();
  const pointId = searchParams.get('pointId');
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  const { images, loading: imagesLoading } = useProductImages(productId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем данные производителя
        const { data: producerData, error: producerError } = await supabase
          .from('producer_profiles')
          .select('*')
          .eq('slug', producerSlug)
          .single();

        if (producerError || !producerData) {
          console.error('Producer not found:', producerError);
          setLoading(false);
          return;
        }

        // Получаем данные товара
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            product_images!fk_product_images_product_id (
              image_url,
              is_primary
            )
          `)
          .eq('id', productId)
          .eq('producer_id', producerData.id)
          .single();

        if (productError || !productData) {
          console.error('Product not found:', productError);
          setLoading(false);
          return;
        }

        const primaryImage = productData.product_images?.find(img => img.is_primary);
        
        setProducer({
          id: producerData.id,
          slug: producerData.slug,
          producerName: producerData.producer_name,
          currency: producerData.currency
        });

        setProduct({
          id: productData.id,
          productName: productData.name,
          description: productData.description,
          price_regular: parseFloat(productData.price_regular || 0),
          price_discount: productData.price_discount ? parseFloat(productData.price_discount) : null,
          price_unit: productData.price_unit || 'шт',
          image: primaryImage?.image_url || '/placeholder.svg',
          ingredients: productData.ingredients,
          allergen_info: productData.allergen_info,
          quantity: productData.quantity,
          in_stock: productData.in_stock
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [producerSlug, productId]);

  const handleAddToCart = () => {
    if (product && producer) {
      addToCart(product, producer.slug);
      toast.success('Товар добавлен в корзину');
    }
  };

  const handleBack = () => {
    if (pointId) {
      navigate(`/producer/${producerSlug}/products?pointId=${pointId}`);
    } else {
      navigate(`/producer/${producerSlug}`);
    }
  };

  const calculateDiscount = (regular, discounted) => {
    return Math.round((1 - discounted / regular) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!product || !producer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Товар не найден</h2>
        <p className="text-muted-foreground mb-8">К сожалению, такого товара нет в нашей базе.</p>
        <Link to="/" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition duration-300">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(producer.currency || 'MDL');
  const hasDiscount = product.price_discount && product.price_discount < product.price_regular;
  
  // Use images from product_images table or fallback to product.image
  const displayImages = images.length > 0 
    ? images.map(img => img.image_url) 
    : [product.image];

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumbs Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Главная
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/producer/${producerSlug}`} className="flex items-center gap-1">
                    <Store className="h-4 w-4" />
                    {producer.producerName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">{product.productName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Product Image Gallery */}
          <div className="relative">
            {imagesLoading ? (
              <div className="w-full h-96 bg-muted animate-pulse" />
            ) : displayImages.length > 1 ? (
              <div className="relative group">
                <Carousel className="w-full">
                  <CarouselContent>
                    {displayImages.map((imageUrl, index) => (
                      <CarouselItem key={index}>
                        <div className="relative cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
                          <img 
                            src={imageUrl} 
                            alt={`${product.productName} - фото ${index + 1}`} 
                            className="w-full h-96 object-cover"
                            onError={(e) => {
                              console.error('Failed to load image:', imageUrl);
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {hasDiscount && index === 0 && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                              -{calculateDiscount(product.price_regular, product.price_discount)}%
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4">
                    <span className="sr-only">Предыдущее фото</span>
                  </CarouselPrevious>
                  <CarouselNext className="right-4">
                    <span className="sr-only">Следующее фото</span>
                  </CarouselNext>
                </Carousel>
              </div>
            ) : (
              <div className="relative group cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
                <img 
                  src={displayImages[0]} 
                  alt={product.productName} 
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    console.error('Failed to load single image:', displayImages[0]);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Maximize2 className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {hasDiscount && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    -{calculateDiscount(product.price_regular, product.price_discount)}%
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gallery Modal */}
          <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <DialogContent className="max-w-4xl h-[90vh] p-0">
              <div className="relative h-full flex items-center justify-center bg-black">
                <Carousel className="w-full h-full">
                  <CarouselContent className="h-full">
                    {displayImages.map((imageUrl, index) => (
                      <CarouselItem key={index} className="h-full flex items-center justify-center">
                        <img 
                          src={imageUrl} 
                          alt={`${product.productName} - фото ${index + 1}`} 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            console.error('Failed to load image:', imageUrl);
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4">
                    <span className="sr-only">Предыдущее фото</span>
                  </CarouselPrevious>
                  <CarouselNext className="right-4">
                    <span className="sr-only">Следующее фото</span>
                  </CarouselNext>
                </Carousel>
              </div>
            </DialogContent>
          </Dialog>

          {/* Product Details */}
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-3">{product.productName}</h1>
              <p className="text-muted-foreground text-lg">{product.description}</p>
            </div>

            {/* Ingredients */}
            {product.ingredients && (
              <div className="bg-muted p-5 rounded-lg mb-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <List className="h-5 w-5" /> Состав
                </h4>
                <p className="text-sm text-muted-foreground">{product.ingredients}</p>
              </div>
            )}

            {/* Allergens */}
            {product.allergen_info && (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg mb-6">
                <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5" /> Аллергены
                </h4>
                <p className="text-sm text-amber-700">{product.allergen_info}</p>
              </div>
            )}

            {/* Price and Actions */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  {hasDiscount ? (
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-green-600">
                        {product.price_discount} {currencySymbol}/{product.price_unit}
                      </span>
                      <span className="text-base text-muted-foreground line-through">
                        {product.price_regular} {currencySymbol}/{product.price_unit}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-green-600">
                      {product.price_regular} {currencySymbol}/{product.price_unit}
                    </span>
                  )}
                </div>
                <Button 
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> Добавить в корзину
                </Button>
              </div>
              
              <Button 
                onClick={handleBack}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Вернуться к товарам точки
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
