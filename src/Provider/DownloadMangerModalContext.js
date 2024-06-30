// DownloadMangerModalContext.js
import React, { createContext, useContext, useState } from 'react';

const DownloadMangerModalContext = createContext();

export const DownloadMangerModalProvider = ({ children }) => {
    const [isDownloadManager, setIsDownloadManager] = useState(false);

    const openDownloadManager = () => {
        setIsDownloadManager(true);
    };

    const closeDownloadManager = () => {
        setIsDownloadManager(false);
    };

    return (
        <DownloadMangerModalContext.Provider value={{ isDownloadManager, openDownloadManager, closeDownloadManager }}>
            {children}
        </DownloadMangerModalContext.Provider>
    );
};

export const useDownloadManagerModal = () => {
    return useContext(DownloadMangerModalContext);
};
