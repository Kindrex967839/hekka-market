import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  children: ReactNode;
}

export const OuterErrorBoundary = ({ children }: Props) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6 font-mono text-sm break-words">
              {error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#ff3b9a] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#e6358b] transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      )}
      onError={(error) => {
        console.error("Caught error in AppWrapper", error.message, error.stack);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
