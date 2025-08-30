import React from 'react';

const ActionButton = ({ children, onClick, variant = 'primary' }) => {
    const baseClasses = "w-full text-left font-semibold py-3 px-5 rounded-full transition-all transform hover:scale-105";
    
    const styles = {
        primary: "bg-black text-white hover:bg-gray-800",
        secondary: "bg-white/5 border border-white/20 text-white hover:bg-white/10"
    };

    return (
        <button onClick={onClick} className={`${baseClasses} ${styles[variant]}`}>
            {children}
        </button>
    );
};

export default ActionButton;