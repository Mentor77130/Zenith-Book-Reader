import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  active = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20",
    secondary: "bg-gray-750 text-gray-200 hover:bg-gray-700 border border-gray-600",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
    icon: "p-2 rounded-full hover:bg-white/10 text-gray-300"
  };

  const activeStyles = active ? "bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/50" : "";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const finalSize = variant === 'icon' ? '' : sizes[size];

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${finalSize} ${activeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};