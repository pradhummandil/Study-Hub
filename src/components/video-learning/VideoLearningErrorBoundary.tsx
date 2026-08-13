import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class VideoLearningErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[VideoLearningErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[420px] bg-[#F8F6F0] text-[#1C201D] flex items-center justify-center p-6 my-8 rounded-3xl border border-[#1C201D]/10 shadow-sm">
          <div className="max-w-md w-full text-center space-y-5 bg-[#FFFFFF] p-8 rounded-2xl border border-[#1C201D]/10 shadow-md">
            <div className="w-14 h-14 rounded-full bg-[#C86D51]/10 text-[#C86D51] flex items-center justify-center mx-auto border border-[#C86D51]/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-[#1C201D]">
                We couldn't load Video Learning.
              </h3>
              <p className="text-sm text-[#6C706D] leading-relaxed">
                Your saved lesson library is temporarily unavailable.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleRetry}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2D5A3F] hover:bg-[#2D5A3F]/90 text-[#FFFFFF] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
              <a
                href="/studio"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#EDE8DB] hover:bg-[#EDE8DB]/80 text-[#1C201D] font-bold text-xs border border-[#1C201D]/10 transition-all flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#2D5A3F]" /> Go to Studio
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
