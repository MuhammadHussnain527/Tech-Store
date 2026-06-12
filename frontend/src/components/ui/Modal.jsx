import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'max-w-md'
}) => {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-midnight-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Modal Panel */}
            <div 
                className={`relative w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-white dark:bg-midnight-900 text-left align-middle shadow-2xl transition-all animate-slide-up border border-midnight-200 dark:border-midnight-700`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-midnight-100 dark:border-midnight-800">
                    {title && (
                        <h3 className="text-lg font-bold text-midnight-900 dark:text-white" id="modal-title">
                            {title}
                        </h3>
                    )}
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-slate-400 hover:text-midnight-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Body */}
                <div className="px-6 py-4">
                    {children}
                </div>
                
                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 bg-slate-50 dark:bg-midnight-800/50 border-t border-midnight-100 dark:border-midnight-800 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
