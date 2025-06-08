
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/HeroSection';
import CategoryList from '../components/CategoryList';

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="pb-20">
      <div className="container mx-auto px-4 py-8">
        <HeroSection />
        <CategoryList />
      </div>
    </div>
  );
};

export default Index;
