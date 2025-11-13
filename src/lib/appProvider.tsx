"use client";
import React, { useMemo } from "react";
import { StoreProvider } from "@lib/redux/providers";
import ThemeProvider from '@theme/theme';
import { LoadingProvider } from '@src/context/LoadingContext';
import { buildProvidersTree } from "./buildProvidersTree";
import { QueryClientProvider } from "./react-query";
import { UserProvider } from "@src/context/user-context";
import { ToastContainer } from "@components/core/toast";
import PusherClient from "@components/core/pusherClient";
export default function AppProvider({ children }: { children?: React.ReactNode }) {
    const ProvidersTree = useMemo(() => buildProvidersTree([
        [StoreProvider],
        [UserProvider],
        [QueryClientProvider],
        [ThemeProvider],
        [LoadingProvider],


    ]), [])
    return (
        <>
            <ProvidersTree>
                {/* <GlobalLoadingOverlay /> */}
                <PusherClient />
                <ToastContainer />
                {children}
            </ProvidersTree>
        </>
    );
}
