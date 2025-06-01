import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ 
  cardConfig, 
  value, 
  trend, 
  navigateTo, 
  description, 
  badgeCount, 
  isEditMode, 
  onRemoveCard 
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white overflow-hidden shadow rounded-lg relative"
    >
      {isEditMode && (
        <button
          onClick={() => onRemoveCard(cardConfig.id)}
          className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
        >
          ×
        </button>
      )}
      
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {cardConfig.icon ? (
              <cardConfig.icon className="h-6 w-6 text-blue-600" />
            ) : (
              <div className="h-6 w-6 bg-blue-600 rounded"></div>
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {cardConfig.title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
                {badgeCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {badgeCount}
                  </span>
                )}
              </dd>
            </dl>
          </div>
        </div>
        {trend && (
          <p className="mt-2 text-sm text-gray-500">{trend}</p>
        )}
        {description && (
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;


