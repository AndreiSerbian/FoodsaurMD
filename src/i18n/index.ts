
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ru: {
    translation: {
      // Navigation
      home: 'Главная',
      login: 'Вход',
      register: 'Регистрация',
      logout: 'Выйти',
      
      // Forms
      producerName: 'Название производителя',
      phone: 'Телефон',
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Повтор пароля',
      address: 'Адрес',
      
      // Buttons
      submit: 'Отправить',
      cancel: 'Отмена',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      add: 'Добавить',
      
      // Messages
      loginSuccess: 'Успешный вход',
      registerSuccess: 'Регистрация успешна! Проверьте email для подтверждения.',
      confirmEmail: 'Пожалуйста, подтвердите ваш email',
      passwordsNotMatch: 'Пароли не совпадают',
      emailRequired: 'Email обязателен',
      passwordRequired: 'Пароль обязателен',
      nameRequired: 'Название производителя обязательно',
      
      // Dashboard
      dashboard: 'Панель управления',
      products: 'Товары',
      addProduct: 'Добавить товар',
      editProduct: 'Редактировать товар',
      productName: 'Название товара',
      description: 'Описание',
      price: 'Цена',
      regularPrice: 'Обычная цена',
      discountPrice: 'Цена со скидкой',
      quantity: 'Количество',
      
      // Map
      producersMap: 'Карта производителей',
      
      // Placeholders
      enterName: 'Введите название',
      enterEmail: 'Введите email',
      enterPassword: 'Введите пароль',
      enterPhone: 'Введите телефон',
      enterAddress: 'Введите адрес',
      enterDescription: 'Введите описание',
    }
  },
  ro: {
    translation: {
      // Navigation
      home: 'Acasă',
      login: 'Autentificare',
      register: 'Înregistrare',
      logout: 'Ieșire',
      
      // Forms
      producerName: 'Numele producătorului',
      phone: 'Telefon',
      email: 'Email',
      password: 'Parolă',
      confirmPassword: 'Repetați parola',
      address: 'Adresă',
      
      // Buttons
      submit: 'Trimite',
      cancel: 'Anulare',
      save: 'Salvează',
      delete: 'Șterge',
      edit: 'Editează',
      add: 'Adaugă',
      
      // Messages
      loginSuccess: 'Autentificare reușită',
      registerSuccess: 'Înregistrare reușită! Verificați emailul pentru confirmare.',
      confirmEmail: 'Vă rugăm să confirmați emailul',
      passwordsNotMatch: 'Parolele nu se potrivesc',
      emailRequired: 'Emailul este obligatoriu',
      passwordRequired: 'Parola este obligatorie',
      nameRequired: 'Numele producătorului este obligatoriu',
      
      // Dashboard
      dashboard: 'Panoul de control',
      products: 'Produse',
      addProduct: 'Adaugă produs',
      editProduct: 'Editează produsul',
      productName: 'Numele produsului',
      description: 'Descriere',
      price: 'Preț',
      regularPrice: 'Preț obișnuit',
      discountPrice: 'Preț cu reducere',
      quantity: 'Cantitate',
      
      // Map
      producersMap: 'Harta producătorilor',
      
      // Placeholders
      enterName: 'Introduceți numele',
      enterEmail: 'Introduceți emailul',
      enterPassword: 'Introduceți parola',
      enterPhone: 'Introduceți telefonul',
      enterAddress: 'Introduceți adresa',
      enterDescription: 'Introduceți descrierea',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
