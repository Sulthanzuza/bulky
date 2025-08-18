import React from 'react';

interface CardProps {
  step: number;
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ step, title, children }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center space-x-4 bg-gray-50/70">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
          {step}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;