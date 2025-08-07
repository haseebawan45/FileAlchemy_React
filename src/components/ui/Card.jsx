import React from 'react';

const Card = ({ children, className = '', hover = true, onClick, ...props }) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`;
  
  return (
    <div 
      className={classes} 
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
