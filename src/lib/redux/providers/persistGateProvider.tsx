'use client'
import { Persistor } from "redux-persist/es/types";
import { PersistGate } from 'redux-persist/integration/react';
import { useRef } from "react";
import { persistStore } from "redux-persist";
import { AppStore } from "../store";

function PersistGateProvider({ children, store }: { children: React.ReactNode, store: AppStore }) {
    const persistor = useRef<Persistor | null>(null);

    if (!persistor.current) {
        // Create the persistor instance the first time this renders
        persistor.current = persistStore(store);
    }

    return (
        <PersistGate loading={false} persistor={persistor.current}>
            {children}
        </PersistGate>
    )
}

export default PersistGateProvider
