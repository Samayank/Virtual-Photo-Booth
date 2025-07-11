import React from 'react';
import { motion } from 'framer-motion';
import { camanFilters } from '../lib/camanFilters';

interface HorizontalFilterSelectorProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const getFilterPreview = (filterId: string) => {
  switch (filterId) {
    case 'none': return 'bg-gradient-to-br from-blue-500 to-purple-600';
    case 'blackWhite': return 'bg-gradient-to-br from-gray-300 to-gray-800';
    case 'vintage': return 'bg-gradient-to-br from-amber-600 to-orange-700';
    case 'warm': return 'bg-gradient-to-br from-yellow-400 to-red-500';
    case 'cool': return 'bg-gradient-to-br from-blue-400 to-cyan-500';
    case 'sepia': return 'bg-gradient-to-br from-amber-700 to-yellow-800';
    case 'lomo': return 'bg-gradient-to-br from-pink-500 to-purple-600';
    case 'clarity': return 'bg-gradient-to-br from-blue-500 to-cyan-400';
    case 'sunrise': return 'bg-gradient-to-br from-yellow-400 to-red-500';
    default: return 'bg-gradient-primary';
  }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm': return 'w-12 h-12 text-xs';
    case 'md': return 'w-16 h-16 text-sm';
    case 'lg': return 'w-20 h-20 text-base';
    default: return 'w-16 h-16 text-sm';
  }
};

export const HorizontalFilterSelector: React.FC<HorizontalFilterSelectorProps> = ({
  selectedFilter,
  onFilterChange,
  className = '',
  showLabel = true,
  size = 'md'
}) => {
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <p className="text-sm text-muted-foreground mb-3 text-center">
          Tap a filter to preview
        </p>
      )}
      
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-3 px-2 pb-2 min-w-max">
          {camanFilters.map((filter) => (
            <motion.div
              key={filter.id}
              className="flex flex-col items-center space-y-2 flex-shrink-0"
              whileTap={{ scale: 0.95 }}
            >
              <motion.button
                onClick={() => onFilterChange(filter.id)}
                whileHover={{ scale: 1.05 }}
                className={`
                  relative ${sizeClasses} rounded-xl ${getFilterPreview(filter.id)}
                  border-2 transition-all duration-200 cursor-pointer
                  ${selectedFilter === filter.id 
                    ? 'border-white shadow-lg shadow-primary/20 ring-2 ring-primary/50' 
                    : 'border-white/30 hover:border-white/60'
                  }
                `}
              >
                {/* Preview icon or pattern */}
                <div className="absolute inset-2 rounded-lg bg-white/20 backdrop-blur-sm"></div>
                
                {/* Selected indicator */}
                {selectedFilter === filter.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </motion.div>
                )}
              </motion.button>
              
              {/* Filter name */}
              <span className={`
                text-xs font-medium text-center min-w-0 max-w-[4rem]
                ${selectedFilter === filter.id ? 'text-primary' : 'text-muted-foreground'}
              `}>
                {filter.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};