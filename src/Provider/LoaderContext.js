import React, { createContext, useState, useContext } from 'react';

// Step 2: Create the Loader Context
const LoaderContext = createContext();

// Step 3: Create the LoaderProvider component
export const LoaderProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Define functions to show/hide the loader
    const showLoader = () => setIsLoading(true);
    const hideLoader = () => setIsLoading(false);

    return (
        // Step 4: Provide the loader state and functions to the children
        <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
            {children}
        </LoaderContext.Provider>
    );
};

// Step 5: Create a custom hook to easily access the LoaderContext
export const useLoader = () => {
    const context = useContext(LoaderContext);
    if (!context) {
        throw new Error('useLoader must be used within a LoaderProvider');
    }
    return context;
};
