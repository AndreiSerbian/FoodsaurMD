
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserRoles, useUpdateUserRole } from '../hooks/useUserRoles';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User } from 'lucide-react';

const AdminPanel = () => {
  const [userId, setUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('producer');
  const { user, userRole } = useAuth();
  const { data: userRoles = [], isLoading } = useUserRoles();
  const updateUserRole = useUpdateUserRole();
  const { toast } = useToast();

  // Проверка прав доступа
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ запрещён</h1>
          <p className="text-gray-600">У вас нет прав для доступа к админ-панели.</p>
        </div>
      </div>
    );
  }

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ID пользователя",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUserRole.mutateAsync({
        userId: userId.trim(),
        role: selectedRole
      });
      
      toast({
        title: "Успешно",
        description: `Роль ${selectedRole} назначена пользователю`,
      });
      
      setUserId('');
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить роль пользователя",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Shield className="h-8 w-8 mr-2 text-blue-600" />
            Панель администратора
          </h1>
          <p className="text-gray-600">Управление ролями пользователей</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Назначить роль пользователю</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateRole} className="space-y-4">
                <div>
                  <Label htmlFor="userId">ID пользователя</Label>
                  <Input
                    id="userId"
                    placeholder="Введите ID пользователя"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Роль</Label>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="producer">Производитель</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
                
                <Button
                  type="submit"
                  disabled={updateUserRole.isPending}
                  className="w-full"
                >
                  {updateUserRole.isPending ? 'Обновление...' : 'Назначить роль'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список пользователей с ролями</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userRoles.map((userRole) => (
                  <div key={userRole.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{userRole.user_id}</p>
                      </div>
                    </div>
                    <Badge variant={userRole.role === 'admin' ? 'default' : 'secondary'}>
                      {userRole.role === 'admin' ? 'Админ' : 'Производитель'}
                    </Badge>
                  </div>
                ))}
                {userRoles.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Пользователи с ролями не найдены
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
