"use client";

import { createContext, useContext, useCallback } from "react";

// ── Context for global in-app browser ───────
// All external links now open in a new browser tab.
// Most modern websites block iframe embedding via X-Frame-Options / CSP headers,
// making the iframe-based in-app browser unreliable. Opening in a new tab is the
// universal, reliable approach.
interface InAppBrowserCtx {
    open: (url: string, title?: string) => void;
    close: () => void;
}

const InAppBrowserContext = createContext<InAppBrowserCtx>({
    open: () => { },
    close: () => { },
});

export function useInAppBrowser() {
    return useContext(InAppBrowserContext);
}

export function InAppBrowserProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const open = useCallback((url: string, _title?: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    }, []);

    const close = useCallback(() => {
        // No-op since we no longer have an in-app modal
    }, []);

    return (
        <InAppBrowserContext.Provider value={{ open, close }}>
            {children}
        </InAppBrowserContext.Provider>
    );
}
