import React from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useGlobalErrorHandler } from "../../hooks/useGlobalErrorHandler";
import ErrorFallback from "../ErrorFallback";

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({
  children,
}) => {
  const { errorState, resetError } = useGlobalErrorHandler();

  if (errorState.hasError && errorState.error) {
    return (
      <ErrorFallback
        error={errorState.error}
        errorInfo={errorState.errorInfo}
        resetErrorBoundary={resetError}
      />
    );
  }

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          errorInfo={{ type: "component", source: "react-error-boundary" }}
          resetErrorBoundary={resetErrorBoundary}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default GlobalErrorBoundary;
