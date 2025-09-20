import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import ProductManagement from '../components/ProductManagement';
import CategoryManagement from '../components/CategoryManagement';
import PickupPointManagement from '../components/PickupPointManagement';
import OrderManagement from '../components/OrderManagement';
import OrderConfirmationPanel from '../components/OrderConfirmationPanel';
import PointProductsManagement from '../components/admin/PointProductsManagement';
import GlobalCatalogManagement from '../components/admin/GlobalCatalogManagement';
import InventoryManagement from '../components/admin/InventoryManagement';
import SampleData from '../components/fixtures/SampleData';
import DataDebugPanel from '../components/debug/DataDebugPanel';
import CategorySelector from '../components/CategorySelector';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useProducerCategories } from '../hooks/useProducerCategories';
const Dashboard = () => {
  const {
    user
  } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    producer_name: '',
    address: '',
    phone: '',
    telegram_handle: '',
    discount_available_time: ''
  });
  const {
    categories: producerCategories,
    loading: categoriesLoading
  } = useProducerCategories(profile?.id);
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);
  const fetchProfile = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('producer_profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (!error) {
        if (data) {
          setProfile(data);
          setFormData({
            producer_name: data.producer_name || '',
            address: data.address || '',
            phone: data.phone || '',
            telegram_handle: data.telegram_handle || '',
            discount_available_time: data.discount_available_time || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (profile) {
        // Обновляем существующий профиль
        const {
          data,
          error
        } = await supabase.from('producer_profiles').update(formData).eq('id', profile.id).select().single();
        if (!error) {
          setProfile(data);
          setEditing(false);
        }
      } else {
        // Создаем новый профиль
        const {
          data,
          error
        } = await supabase.from('producer_profiles').insert({
          ...formData,
          user_id: user.id
        }).select().single();
        if (!error) {
          setProfile(data);
          setEditing(false);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  if (loading && !profile) {
    return <div className="flex justify-center items-center h-64">Загрузка...</div>;
  }
  return <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Панель производителя</h1>
      
      {/* Профиль производителя */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Профиль производителя
            </h3>
            {profile && !editing && <Button onClick={() => setEditing(true)} variant="outline" className="text-gray-50 bg-green-900 hover:bg-green-800">
                Редактировать
              </Button>}
          </div>

          {!profile || editing ? <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="producer_name">Название компании</Label>
                <Input id="producer_name" name="producer_name" value={formData.producer_name} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="address">Адрес</Label>
                <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>

                <div>
                  <Label htmlFor="telegram_handle">Telegram</Label>
                  <Input id="telegram_handle" name="telegram_handle" value={formData.telegram_handle} onChange={handleChange} placeholder="@username" />
                </div>
              </div>

              <div>
                <Label htmlFor="discount_available_time">Время доступности скидок</Label>
                <Input id="discount_available_time" name="discount_available_time" value={formData.discount_available_time} onChange={handleChange} placeholder="например: пн-пт 9:00-18:00" />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading} className="bg-green-900 hover:bg-green-800 text-gray-50">
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
                {editing && <Button type="button" variant="outline" onClick={() => setEditing(false)} className="bg-red-700 hover:bg-red-600 text-gray-50">
                    Отмена
                  </Button>}
              </div>
            </form> : <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Название компании</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.producer_name}</dd>
              </div>
              
              {profile.address && <div>
                  <dt className="text-sm font-medium text-gray-500">Адрес</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.address}</dd>
                </div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.phone && <div>
                    <dt className="text-sm font-medium text-gray-500">Телефон</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.phone}</dd>
                  </div>}

                {profile.telegram_handle && <div>
                    <dt className="text-sm font-medium text-gray-500">Telegram</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.telegram_handle}</dd>
                  </div>}
              </div>

              {profile.discount_available_time && <div>
                  <dt className="text-sm font-medium text-gray-500">Время доступности скидок</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.discount_available_time}</dd>
                </div>}

              {!categoriesLoading && producerCategories.length > 0 && <div>
                  <dt className="text-sm font-medium text-gray-500">Категории</dt>
                  <dd className="mt-1">
                    <div className="flex flex-wrap gap-2">
                      {producerCategories.map(category => <span key={category.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {category.name}
                        </span>)}
                    </div>
                  </dd>
                </div>}
            </div>}
        </div>
      </div>

      {/* Управление категориями */}
      {profile && <CategoryManagement producerProfile={profile} />}

      {/* Управление глобальным каталогом */}
      {profile && <GlobalCatalogManagement producerProfile={profile} />}

      {/* Управление товарами в точках выдачи */}
      {profile && <PointProductsManagement producerProfile={profile} />}

      {/* Управление остатками и вариантами */}
      {profile && <InventoryManagement producerPointId={null} />}

      {/* Управление точками выдачи */}
      <PickupPointManagement producerProfile={profile} />

      {/* Панель подтверждения заказов */}
      {profile && <OrderConfirmationPanel producerId={profile.id} />}

      {/* Управление заказами */}
      <OrderManagement producerProfile={profile} />

      {/* Панель отладки данных */}
      {profile && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <SampleData />
            <DataDebugPanel 
              producerSlug={profile.slug}
              pointId={null}
            />
          </div>
        </div>
      )}
    </div>;
};
export default Dashboard;