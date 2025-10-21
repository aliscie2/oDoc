import React from 'react';
import styles from './badge.module.css';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline';
  children?: React.ReactNode;
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <div className={`${styles.badge} ${styles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
