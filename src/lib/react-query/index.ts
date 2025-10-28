import { QueryClient } from "@tanstack/react-query";

// Create a single shared QueryClient instance
export const sharedQueryClient = new QueryClient();

export * from "./getQueryClient";
export { default as QueryClientProvider } from "./providers";
