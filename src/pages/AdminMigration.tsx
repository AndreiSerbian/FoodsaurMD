
import React from 'react';
import DataMigration from '../components/DataMigration';
import DemoDataCleaner from '../components/DemoDataCleaner';

const AdminMigration: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Администрирование</h1>
        
        <div className="space-y-8">
          <DataMigration />
          <DemoDataCleaner />
        </div>
      </div>
    </div>
  );
};

export default AdminMigration;
