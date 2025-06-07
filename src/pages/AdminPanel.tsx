
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserRoles, useUpdateUserRole } from '../hooks/useUserRoles';
import { useProducersWithProducts } from '../hooks/useProducersWithProducts';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Users, Settings, Shield } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { userRole, loading: authLoading } = useAuth();
  const { data: userRoles, isLoading: rolesLoading } = useUserRoles();
  const { data: producers, isLoading: producersLoading } = useProducersWithProducts(true);
  const updateUserRoleMutation = useUpdateUserRole();
  const [selectedRole, setSelectedRole] = useState<{ [key: string]: string }>({});

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'producer') => {
    try {
      await updateUserRoleMutation.mutateAsync({ userId, role: newRole });
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-8">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Roles Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Управление ролями пользователей
              </CardTitle>
              <CardDescription>
                Назначайте роли администратора или производителя пользователям
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <div className="text-center py-4">Загрузка пользователей...</div>
              ) : (
                <div className="space-y-4">
                  {userRoles?.map((userRole) => (
                    <div key={userRole.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{userRole.user?.email || 'Неизвестный пользователь'}</p>
                        <Badge variant={userRole.role === 'admin' ? 'default' : 'secondary'}>
                          {userRole.role === 'admin' ? 'Администратор' : 'Производитель'}
                        </Badge>
                      </div>
                      <Select
                        value={selectedRole[userRole.user_id] || userRole.role}
                        onValueChange={(value) => {
                          setSelectedRole({ ...selectedRole, [userRole.user_id]: value });
                          handleRoleUpdate(userRole.user_id, value as 'admin' | 'producer');
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="producer">Производитель</SelectItem>
                          <SelectItem value="admin">Администратор</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Producers Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Обзор производителей
              </CardTitle>
              <CardDescription>
                Информация о всех производителях в системе
              </CardDescription>
            </CardHeader>
            <CardContent>
              {producersLoading ? (
                <div className="text-center py-4">Загрузка производителей...</div>
              ) : (
                <div className="space-y-4">
                  {producers?.map((producer) => (
                    <div key={producer.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{producer.producer_name}</h3>
                        <div className="flex space-x-2">
                          {producer.is_verified && (
                            <Badge className="bg-green-100 text-green-800">
                              Верифицирован
                            </Badge>
                          )}
                          {producer.is_demo && (
                            <Badge variant="outline">
                              Демо
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Товаров: {producer.products?.length || 0}
                      </p>
                      {producer.category && (
                        <Badge variant="secondary">
                          {producer.category.name}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Alert className="mt-8">
          <AlertDescription>
            <strong>Инструкция:</strong> Для создания нового администратора или производителя, 
            пользователь должен сначала зарегистрироваться через страницу /auth, а затем вы можете 
            изменить его роль здесь.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default AdminPanel;
