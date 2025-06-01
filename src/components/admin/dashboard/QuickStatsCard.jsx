import React from 'react';

const QuickStatsCard = ({ isEditMode, onRemoveCard, statsData, className = '' }) => {
  return (
    <div className={`bg-white shadow rounded-lg relative ${className}`}>
      {isEditMode && (
        <button
          onClick={() => onRemoveCard('quickStats')}
          className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
        >
          ×
        </button>
      )}
      
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statsData?.newMembersThisMonth || 0}
            </div>
            <div className="text-sm text-gray-500">New Members This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {statsData?.classAttendanceRate || '0%'}
            </div>
            <div className="text-sm text-gray-500">Class Attendance Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {statsData?.membershipRenewalRate || '0%'}
            </div>
            <div className="text-sm text-gray-500">Renewal Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStatsCard;


