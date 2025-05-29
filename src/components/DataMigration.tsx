
import React, { useState } from 'react';
import { Button } from './ui/button';
import { migrateProducersToSupabase, type MigrationResult } from '../utils/dataMigration';

const DataMigration: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const handleMigration = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const migrationResult = await migrateProducersToSupabase();
      setResult(migrationResult);
    } catch (error) {
      setResult({
        success: false,
        message: `Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Миграция данных</h2>
      <p className="text-gray-600 mb-6">
        Этот инструмент перенесет данные производителей и продуктов из статических файлов в Supabase.
      </p>
      
      <Button 
        onClick={handleMigration} 
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? 'Выполняется миграция...' : 'Запустить миграцию'}
      </Button>

      {result && (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? 'Миграция успешна!' : 'Ошибка миграции'}
          </h3>
          <p className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.message}
          </p>
          
          {result.details && (
            <div className="mt-2 text-sm">
              {result.details.migratedCount && (
                <p>Обработано производителей: {result.details.migratedCount}</p>
              )}
              {result.details.errors && (
                <div className="mt-2">
                  <p className="font-semibold">Ошибки:</p>
                  <ul className="list-disc list-inside">
                    {result.details.errors.map((error: string, index: number) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataMigration;
