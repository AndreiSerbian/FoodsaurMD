
export const getCategoryName = (categorySlug, t) => {
  const translationKey = `categories.${categorySlug}`;
  const translated = t(translationKey);
  return translated !== translationKey ? translated : categorySlug;
};

export const getCategoryImage = (categorySlug) => {
  const imageMap = {
    'moldavian': '/src/assets/Images/categories/moldavian.jpg',
    'european': '/src/assets/Images/categories/european.jpg',
    'panasian': '/src/assets/Images/categories/panasian.jpg',
    'drinks': '/src/assets/Images/categories/drinks.jpg',
    'desserts': '/src/assets/Images/categories/desserts.jpg'
  };
  
  return imageMap[categorySlug] || "/placeholder.svg";
};
