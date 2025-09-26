/**
 * Error boundary component for handling React errors
 */
"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h2 className="font-heading text-2xl mb-4">
                Something went wrong
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-accent-darkest px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Reload page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
