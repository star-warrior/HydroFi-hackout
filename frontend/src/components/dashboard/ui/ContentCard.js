import React from 'react';

const ContentCard = ({ title, children, className }) => (
    <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl ${className}`}>
        <h4 className="text-xl font-bold text-white mb-4">{title}</h4>
        <div>{children}</div>
    </div>
);

export default ContentCard;