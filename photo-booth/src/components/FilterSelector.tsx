import React from 'react';
import { motion } from 'framer-motion';

interface FilterSelectorProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'none', name: 'Original', preview: 'bg-gradient-primary' },
  { id: 'vintage', name: 'Vintage', preview: 'bg-gradient-to-br from-amber-600 to-orange-700' },
  { id: 'lomo', name: 'Lomo', preview: 'bg-gradient-to-br from-pink-500 to-purple-600' },
  { id: 'clarity', name: 'Clarity', preview: 'bg-gradient-to-br from-blue-500 to-cyan-400' },
  { id: 'sunrise', name: 'Sunrise', preview: 'bg-gradient-to-br from-yellow-400 to-red-500' },
  { id: 'crossProcess', name: 'Cross', preview: 'bg-gradient-to-br from-green-400 to-teal-600' },
  { id: 'orangePeel', name: 'Orange', preview: 'bg-gradient-to-br from-orange-400 to-red-600' }
];

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  selectedFilter,
  onFilterChange
}) => {
  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-30"
    >
      <div className="flex flex-col space-y-3">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className={`
              relative w-12 h-12 rounded-xl ${filter.preview} 
              border-2 transition-all duration-200 cursor-pointer
              ${selectedFilter === filter.id 
                ? 'border-white shadow-lg shadow-primary/20' 
                : 'border-white/30 hover:border-white/60'
              }
            `}
            style={{ minHeight: '48px', minWidth: '48px' }}
          >
            <span className="sr-only">{filter.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};