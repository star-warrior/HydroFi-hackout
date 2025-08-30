import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react";

export const RouteContext = createContext();
export const useNav = () => useContext(RouteContext);

export const RouteProvider = ({ children }) => {
    const [page, setPage] = useState(window.location.pathname.slice(1) || 'home');

    const navigate = (target) => {
        // Use only the path, not a full URL
        const path = target === 'home' ? '/' : `/${target}`;
        window.history.pushState({}, '', path);
        setPage(target);
    };

    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname.slice(1) || 'home';
            setPage(path);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return (
        <RouteContext.Provider value={{ page, navigate }}>
            {children}
        </RouteContext.Provider>
    );
};