import React from 'react';

const Input = React.forwardRef(({
    className = '',
    label,
    error,
    leftIcon,
    rightIcon,
    ...props
}, ref) => {
    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-semibold text-midnight-700 dark:text-slate-300 ml-1">
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                {leftIcon && (
                    <div className="absolute left-4 text-slate-400 dark:text-slate-500">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full px-4 py-3 rounded-xl transition-all duration-300 text-sm font-sans
                        bg-white dark:bg-midnight-800/50 
                        border ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-midnight-200 dark:border-midnight-700 focus:ring-gold-500/50 focus:border-gold-500'}
                        text-midnight-900 dark:text-slate-100 placeholder-slate-400
                        focus:outline-none focus:ring-2
                        ${leftIcon ? 'pl-11' : ''}
                        ${rightIcon ? 'pr-11' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-4 text-slate-400 dark:text-slate-500">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <span className="text-xs text-red-500 font-medium ml-1 animate-fade-in-up">
                    {error}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
