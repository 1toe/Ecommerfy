
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-gray-800">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-6">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
        <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
