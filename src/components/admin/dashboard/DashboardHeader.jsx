import React from 'react';

const DashboardHeader = ({ 
  isEditMode, 
  onToggleEditMode, 
  onOpenAddCardDialog 
}) => {
  return (
    <div className="border-b border-gray-200 pb-5 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening at your gym today.</p>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={onToggleEditMode}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isEditMode 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isEditMode ? 'Save Layout' : 'Edit Dashboard'}
        </button>
        
        {isEditMode && (
          <button
            onClick={onOpenAddCardDialog}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Add Card
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;


