import React from 'react';
import styles from './button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function Button({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    size !== 'default' ? styles[size] : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
