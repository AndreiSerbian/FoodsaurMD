
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { clearDemoData, type MigrationResult } from '../utils/dataMigration';
import { AlertTriangle, Trash2, CheckCircle } from 'lucide-react';

const DemoDataCleaner: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearDemo = async () => {
    if (confirmText !== 'УДАЛИТЬ ДЕМО') {
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      const cleanupResult = await clearDemoData();
      setResult(cleanupResult);
      setShowConfirm(false);
      setConfirmText('');
    } catch (error) {
      setResult({
        success: false,
        message: `Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateClear = () => {
    setShowConfirm(true);
    setResult(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto border-l-4 border-red-500">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
        <h2 className="text-2xl font-bold text-red-700">Очистка демо-данных</h2>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <p className="text-red-800 font-medium mb-2">⚠️ Внимание!</p>
        <p className="text-red-700 text-sm">
          Эта операция удалит все демо-данные (производители и товары с флагом is_demo = true).
          Retro Bakery и другие верифицированные данные останутся нетронутыми.
        </p>
      </div>

      {!showConfirm ? (
        <Button 
          onClick={handleInitiateClear}
          variant="destructive"
          className="w-full mb-4"
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Очистить демо-данные
        </Button>
      ) : (
        <div className="space-y-4 mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800 font-medium mb-2">Подтверждение необходимо</p>
            <p className="text-yellow-700 text-sm mb-3">
              Для подтверждения введите: <strong>УДАЛИТЬ ДЕМО</strong>
            </p>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Введите текст подтверждения"
              className="mb-3"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleClearDemo}
              variant="destructive"
              disabled={isLoading || confirmText !== 'УДАЛИТЬ ДЕМО'}
              className="flex-1"
            >
              {isLoading ? 'Удаление...' : 'Подтвердить удаление'}
            </Button>
            <Button 
              onClick={() => {
                setShowConfirm(false);
                setConfirmText('');
              }}
              variant="outline"
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-center mb-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? 'Очистка завершена!' : 'Ошибка очистки'}
            </h3>
          </div>
          <p className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default DemoDataCleaner;
