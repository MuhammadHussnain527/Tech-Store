import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    ...props
}, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
    
    const variants = {
        primary: 'bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-midnight-900 shadow-lg shadow-gold-500/20 uppercase',
        secondary: 'bg-transparent border-2 border-midnight-200 dark:border-midnight-800 text-midnight-900 dark:text-slate-200 hover:border-gold-500 dark:hover:border-gold-500',
        danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20',
        ghost: 'bg-transparent text-midnight-600 dark:text-slate-300 hover:bg-midnight-100 dark:hover:bg-midnight-800',
    };
    
    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        icon: 'p-2',
    };

    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isLoading && leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
});

Button.displayName = 'Button';
export default Button;
