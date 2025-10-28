'use client'
import React, { createContext,  useState, useEffect, useContext } from "react";
import { useAppDispatch } from "@lib/redux/store";
import { setAppData } from "@lib/redux/appData";
// import { setAppData } from '@lib/redux/appData';

interface LoadingContextType {
    loading: boolean;
    setLoading: (v: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
    loading: false,
    setLoading: () => { },
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState(true); // Start loading

// 2. Load app data (basic API should always run first)
useEffect(() => {
  const loadAppData = async () => {
    setLoading(true);
    try {
      const resultAction = await dispatch(setAppData());
      const appData = (resultAction as any)?.payload;
      // Now you can check agency status from response

    } catch (err) {
      console.error("Failed to load app data:", err);
    } finally {
      setLoading(false);
    }
  };

  loadAppData();
}, [dispatch]);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};