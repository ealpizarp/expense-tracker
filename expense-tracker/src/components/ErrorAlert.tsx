import React from 'react';
import { ErrorAlertProps } from '../types';

/**
 * Error alert component
 */
const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div 
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" 
      role="alert" 
      onClick={onDismiss}
    >
      {error}
    </div>
  );
};

export default ErrorAlert;
