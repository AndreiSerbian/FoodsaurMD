
import React, { useState } from 'react';
import { Button } from './ui/button';
import { migrateProducersToSupabase, type MigrationResult } from '../utils/dataMigration';
import { AlertTriangle, Database, CheckCircle } from 'lucide-react';

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
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto border-l-4 border-blue-500">
      <div className="flex items-center mb-4">
        <Database className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-2xl font-bold text-blue-700">Миграция данных</h2>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium mb-2">Информация о миграции</p>
            <div className="text-blue-700 text-sm space-y-1">
              <p>• Этот инструмент обновит существующие данные производителей в Supabase</p>
              <p>• Retro Bakery будет помечена как верифицированный производитель</p>
              <p>• Остальные производители будут помечены как демо-данные</p>
              <p>• Для создания новых записей используйте SQL-миграцию в админ-панели</p>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleMigration} 
        disabled={isLoading}
        className="mb-4 w-full"
      >
        <Database className="h-4 w-4 mr-2" />
        {isLoading ? 'Выполняется миграция...' : 'Обновить данные производителей'}
      </Button>

      {result && (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-center mb-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? 'Миграция завершена!' : 'Ошибка миграции'}
            </h3>
          </div>
          <p className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.message}
          </p>
          
          {result.details && (
            <div className="mt-2 text-sm">
              {result.details.migratedCount && (
                <p>Обработано производителей: {result.details.migratedCount}</p>
              )}
              {result.details.note && (
                <p className="text-blue-600 mt-1">{result.details.note}</p>
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
