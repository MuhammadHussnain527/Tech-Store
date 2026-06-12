import React from 'react';

const Badge = ({
    children,
    className = '',
    variant = 'gray',
    icon,
    dot = false
}) => {
    const variants = {
        gold: 'bg-gold-500/10 text-gold-600 border border-gold-500/20 dark:text-gold-400',
        green: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400',
        red: 'bg-red-500/10 text-red-600 border border-red-500/20 dark:text-red-400',
        blue: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400',
        yellow: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400',
        gray: 'bg-slate-100 text-slate-600 border border-transparent dark:bg-slate-800 dark:text-slate-300',
        outline: 'bg-transparent text-slate-600 border border-slate-200 dark:border-slate-700 dark:text-slate-300',
    };

    const dotColors = {
        gold: 'bg-gold-500',
        green: 'bg-emerald-500',
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        yellow: 'bg-amber-500',
        gray: 'bg-slate-500',
        outline: 'bg-slate-500',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase transition-colors ${variants[variant]} ${className}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
            {icon && <span className="w-3.5 h-3.5">{icon}</span>}
            {children}
        </span>
    );
};

export default Badge;
