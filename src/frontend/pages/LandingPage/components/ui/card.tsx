import React from 'react';
import styles from './card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {children}
    </div>
  );
}
