
import React from 'react';
import DataMigration from '../components/DataMigration';

const AdminMigration: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Администрирование</h1>
        <DataMigration />
      </div>
    </div>
  );
};

export default AdminMigration;
