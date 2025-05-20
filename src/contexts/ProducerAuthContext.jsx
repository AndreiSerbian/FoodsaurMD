
import React, { createContext, useContext, useState, useEffect } from 'react';
import { producerCredentials } from '../data/products';

const ProducerAuthContext = createContext();

export const useProducerAuth = () => useContext(ProducerAuthContext);

export const ProducerAuthProvider = ({ children }) => {
  const [currentProducer, setCurrentProducer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Проверка сохраненной сессии при загрузке
  useEffect(() => {
    const savedProducer = localStorage.getItem('currentProducer');
    if (savedProducer) {
      try {
        setCurrentProducer(JSON.parse(savedProducer));
      } catch (e) {
        console.error("Failed to parse saved producer:", e);
        localStorage.removeItem('currentProducer');
      }
    }
    setLoading(false);
  }, []);
  
  // Сохранение сессии при изменении
  useEffect(() => {
    if (currentProducer) {
      localStorage.setItem('currentProducer', JSON.stringify(currentProducer));
    } else {
      localStorage.removeItem('currentProducer');
    }
  }, [currentProducer]);
  
  const login = (username, password) => {
    const producer = producerCredentials.find(
      p => p.username === username && p.password === password
    );
    
    if (producer) {
      const { password, ...producerWithoutPassword } = producer;
      setCurrentProducer(producerWithoutPassword);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setCurrentProducer(null);
  };
  
  return (
    <ProducerAuthContext.Provider value={{ currentProducer, login, logout, loading }}>
      {children}
    </ProducerAuthContext.Provider>
  );
};
