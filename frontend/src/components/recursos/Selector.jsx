import React from 'react';

const Selector = ({ onSelectTipo }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">¿Qué tipo de recurso deseas crear?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <button
          onClick={() => onSelectTipo('kit')}
          className="flex flex-col items-center p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <span className="text-4xl mb-2">🧰</span>
          <span className="font-medium">Kit de Laboratorio</span>
        </button>
        
        <button
          onClick={() => onSelectTipo('llave')}
          className="flex flex-col items-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <span className="text-4xl mb-2">🔑</span>
          <span className="font-medium">Llave</span>
        </button>
        
        <button
          onClick={() => onSelectTipo('proyector')}
          className="flex flex-col items-center p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <span className="text-4xl mb-2">📽️</span>
          <span className="font-medium">Proyector</span>
        </button>
      </div>
    </div>
  );
};

export default Selector;