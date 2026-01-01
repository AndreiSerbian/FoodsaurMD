import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import PointsAdminTable from '../../components/points/PointsAdminTable';
import PointModal from '../../components/points/PointModal';
import GeocodePointsButton from '../../components/points/GeocodePointsButton';

export default function AdminPoints() {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Управление точками выдачи
          </h1>
          <p className="text-muted-foreground">
            Все точки выдачи в системе
          </p>
        </div>
        <GeocodePointsButton onComplete={() => setRefreshKey(prev => prev + 1)} />
      </div>

      <PointsAdminTable
        key={refreshKey}
        onAddPoint={handleAddPoint}
        onEditPoint={handleEditPoint}
      />

      <PointModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        point={editingPoint}
        producerId="" // Админ может создавать точки для любого производителя
      />
    </div>
  );
}