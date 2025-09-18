"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background flex items-center justify-center pt-20">
            <div className="bg-background-lighter rounded-lg p-8 max-w-md w-full text-center">
              <h2 className="font-heading text-xl mb-4">
                Something went wrong
              </h2>
              <p className="text-text/70 mb-6">
                We encountered an unexpected error. Please refresh the page to
                try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-accent-darkest px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
