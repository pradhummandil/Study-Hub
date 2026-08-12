import { Component } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log to console in dev, could send to monitoring in prod
    console.error(`[ErrorBoundary:${this.props.name || 'Unknown'}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Something went wrong in this section</h3>
          <p className="text-white/40 text-sm mb-6 max-w-sm">
            {this.props.name
              ? `The ${this.props.name} section encountered an error.`
              : 'An unexpected error occurred.'}
            {' '}The rest of the application is still working.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-4 text-left max-w-lg">
              <summary className="text-white/30 text-xs cursor-pointer hover:text-white/50">Error details</summary>
              <pre className="mt-2 text-xs text-red-400/70 bg-red-500/5 border border-red-500/10 rounded-lg p-3 overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
