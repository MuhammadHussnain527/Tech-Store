import React from 'react';

const Skeleton = ({ className = '', variant = 'rect' }) => {
    const variants = {
        text: 'rounded',
        circular: 'rounded-full',
        rect: 'rounded-xl',
    };

    return (
        <div 
            className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${variants[variant]} ${className}`} 
            aria-hidden="true"
        />
    );
};

export default Skeleton;
