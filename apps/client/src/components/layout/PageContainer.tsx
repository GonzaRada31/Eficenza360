import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  title, 
  description,
  action 
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
};
