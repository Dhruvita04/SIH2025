import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const spinnerSize = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-3', 
    lg: 'w-12 h-12 border-4'
  }[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${spinnerSize} border-primary-500 border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
