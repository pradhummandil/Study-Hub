import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    console.error(`[ErrorBoundary:${this.props.name || 'Unknown'}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[380px] p-8 text-center bg-[#F8F6F0] text-[#1C201D]">
          <div className="w-14 h-14 rounded-2xl bg-[#C86D51]/10 border border-[#C86D51]/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-[#C86D51]" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-[#1C201D] mb-2">
            Something went wrong in this section
          </h3>

          <p className="text-[#6C706D] text-sm mb-6 max-w-md leading-relaxed">
            {this.props.name
              ? `The ${this.props.name} section encountered a runtime error.`
              : 'An unexpected application error occurred.'}
            {' '}The rest of Study Hub is still fully operational.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D5A3F] text-[#FFFFFF] text-xs font-bold shadow-md hover:bg-[#2D5A3F]/90 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Component
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EDE8DB] text-[#1C201D] text-xs font-bold border border-[#1C201D]/10 hover:bg-[#EDE8DB]/80 transition-all"
            >
              <Home className="w-4 h-4 text-[#2D5A3F]" />
              Return Home
            </a>
          </div>

          {/* Error Trace Details Box */}
          {this.state.error && (
            <div className="mt-6 text-left max-w-xl w-full bg-[#EDE8DB] border border-[#1C201D]/10 rounded-xl p-4 shadow-sm">
              <summary className="text-[#C86D51] text-xs font-bold cursor-pointer uppercase tracking-wider mb-2">
                Technical Error Diagnostic
              </summary>
              <pre className="text-xs font-mono text-[#1C201D] bg-[#FFFFFF] p-3 rounded-lg border border-[#1C201D]/10 overflow-x-auto whitespace-pre-wrap">
                {this.state.error.message || String(this.state.error)}
                {this.state.error.stack && (
                  <span className="block mt-2 text-[11px] text-[#6C706D]">
                    {this.state.error.stack.slice(0, 400)}
                  </span>
                )}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
