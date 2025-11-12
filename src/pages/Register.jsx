
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import CategorySelector from '../components/CategorySelector'

const Register = () => {
  const [formData, setFormData] = useState({
    brandName: '',
    email: '',
    phone: '',
    telegramHandle: '',
    password: '',
    confirmPassword: '',
    categories: [],
    currency: 'MDL'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { signUp } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.brandName.trim()) {
      newErrors.brandName = t('required')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('required')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('required')
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Неверный формат телефона'
    }

    if (!formData.telegramHandle.trim()) {
      newErrors.telegramHandle = 'Telegram обязателен'
    } else if (!/^@?[a-zA-Z0-9_]{5,32}$/.test(formData.telegramHandle.replace('@', ''))) {
      newErrors.telegramHandle = 'Неверный формат Telegram (5-32 символа)'
    }

    if (!formData.password) {
      newErrors.password = t('required')
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = 'Выберите хотя бы одну категорию'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setErrors({})
    setMessage('')

    try {
      const result = await signUp(
        formData.email, 
        formData.password, 
        formData.brandName, 
        formData.phone,
        formData.telegramHandle,
        formData.categories,
        formData.currency
      )

      if (result.needsConfirmation) {
        setMessage(result.message)
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      setErrors({ general: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCategoriesChange = (categories) => {
    setFormData({
      ...formData,
      categories
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('registerTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('loginNotice')}{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              {t('login')}
            </Link>
          </p>
        </div>
        
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.general}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brandName">{t('brandName')}</Label>
              <Input
                id="brandName"
                name="brandName"
                type="text"
                value={formData.brandName}
                onChange={handleChange}
                className={errors.brandName ? 'border-red-300' : ''}
              />
              {errors.brandName && (
                <p className="mt-1 text-sm text-red-600">{errors.brandName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'border-red-300' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'border-red-300' : ''}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telegramHandle">Telegram</Label>
              <Input
                id="telegramHandle"
                name="telegramHandle"
                type="text"
                placeholder="@username"
                value={formData.telegramHandle}
                onChange={handleChange}
                className={errors.telegramHandle ? 'border-red-300' : ''}
              />
              {errors.telegramHandle && (
                <p className="mt-1 text-sm text-red-600">{errors.telegramHandle}</p>
              )}
            </div>

            <CategorySelector
              selectedCategories={formData.categories}
              onCategoriesChange={handleCategoriesChange}
              errors={errors}
            />

            <div>
              <Label htmlFor="currency">Валюта</Label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="MDL">Молдавский лей (MDL)</option>
                <option value="RUP">Рубль ПМР (RUP)</option>
              </select>
              <p className="mt-1 text-sm text-muted-foreground">
                Валюта, в которой будут указаны цены ваших товаров
              </p>
            </div>

            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'border-red-300' : ''}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'border-red-300' : ''}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? t('enterRegister') : t('registerProducer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
