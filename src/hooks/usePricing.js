
export const usePricing = () => {
  const calculateDiscount = (regular, discounted) => {
    if (!discounted || discounted >= regular) return 0;
    return Math.round((1 - discounted / regular) * 100);
  };

  const formatPrice = (price) => {
    return Number(price) || 0;
  };

  const getDisplayPrice = (regularPrice, discountPrice) => {
    const regular = formatPrice(regularPrice);
    const discount = discountPrice ? formatPrice(discountPrice) : null;
    const hasDiscount = discount !== null && discount > 0 && discount < regular;
    
    return {
      regular,
      discount,
      hasDiscount,
      displayPrice: hasDiscount ? discount : regular
    };
  };

  return {
    calculateDiscount,
    formatPrice,
    getDisplayPrice
  };
};
