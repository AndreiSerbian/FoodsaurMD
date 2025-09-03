import React, { useState, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { AuthContext } from '../../contexts/AuthContext';
import PointsAdminTable from '../../components/points/PointsAdminTable';
import PointModal from '../../components/points/PointModal';
import SyncProductsButton from '../../components/SyncProductsButton';

export default function ProducerPoints() {
  const { profile } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddPoint = () => {
    setEditingPoint(null);
    setIsModalOpen(true);
  };

  const handleEditPoint = (point) => {
    setEditingPoint(point);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPoint(null);
  };

  if (!profile?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Профиль производителя не найден
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-bold">
            Мои точки выдачи
          </h1>
          <SyncProductsButton producerId={profile.id} />
        </div>
        <p className="text-muted-foreground">
          Управление точками выдачи вашей продукции
        </p>
      </div>

      <PointsAdminTable
        key={refreshKey}
        producerId={profile.id}
        onAddPoint={handleAddPoint}
        onEditPoint={handleEditPoint}
      />

      <PointModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        point={editingPoint}
        producerId={profile.id}
      />
    </div>
  );
}