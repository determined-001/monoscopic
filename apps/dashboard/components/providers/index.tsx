"use client";

import { Component, type ReactNode } from "react";
import { useMonoscopeSocket } from "@/lib/hooks/useMonoscope";
import { ThemeProvider } from "./theme";
import { ToastProvider } from "../ui/toast";

function SocketMount() {
  useMonoscopeSocket();
  return null;
}

class SocketErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[SocketMount] Unhandled error in WebSocket provider:", error);
  }

  render() {
    if (this.state.error) {
      // Silent failure — the rest of the app keeps working without live data
      console.warn("[SocketMount] WebSocket provider crashed, live data unavailable.");
      return null;
    }
    return this.props.children;
  }
}

function Inner({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SocketErrorBoundary>
        <SocketMount />
      </SocketErrorBoundary>
      {children}
    </ToastProvider>
  );
}

export function MonoscopeProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark">
      <Inner>{children}</Inner>
    </ThemeProvider>
  );
}
