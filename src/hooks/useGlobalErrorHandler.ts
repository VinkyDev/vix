import { message } from "antd";
import { useCallback, useEffect, useState } from "react";

interface GlobalErrorHandlerOptions {
  onError?: (
    error: Error,
    errorInfo?: { type: "promise" | "window" | "component"; source?: string }
  ) => void;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    type: "promise" | "window" | "component";
    source?: string;
  } | null;
}

export const useGlobalErrorHandler = (
  options: GlobalErrorHandlerOptions = {}
) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  const { onError } = options;

  // 重置错误状态
  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }, []);

  // 处理错误
  const handleError = useCallback(
    (
      error: Error,
      errorInfo: { type: "promise" | "window" | "component"; source?: string }
    ) => {
      console.error("Global Error Caught:", error, errorInfo);

      setErrorState({
        hasError: true,
        error,
        errorInfo,
      });

      // 调用自定义错误处理器
      onError?.(error, errorInfo);
    },
    [onError]
  );

  // 处理未捕获的 Promise 错误
  const handleUnhandledRejection = useCallback(
    (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      message.error(error.message);
    },
    []
  );

  // 处理全局 JavaScript 错误
  const handleWindowError = useCallback((event: ErrorEvent) => {
    const error =
      event.error instanceof Error ? event.error : new Error(event.message);

    message.error(error.message);
  }, []);

  // 设置全局错误监听器
  useEffect(() => {
    // 监听未处理的 Promise 错误
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // 监听全局 JavaScript 错误
    window.addEventListener("error", handleWindowError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleWindowError);
    };
  }, [handleWindowError]);

  return {
    errorState,
    resetError,
    handleError,
  };
};
