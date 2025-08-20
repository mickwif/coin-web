import { ToastOptions, toast } from "react-toastify";

const errorCodeMessageMap: Record<number | string, string> = {};

const transformErrorMessage = (code: number | undefined, message: string) => {
  const _message = (code ? errorCodeMessageMap[code] : undefined) ?? message;

  if (code) {
    return `${code}: ${_message}`;
  }
  return _message;
};

export const toastCustom = (
  type: "success" | "error" | "warning" | "info",
  message: string | React.ReactNode,
  options?: ToastOptions
) => {
  return toast[type](message, {
    ...options,
  });
};

export const toastError = (error: any, options?: ToastOptions) => {
  if (!error) {
    return;
  }

  let errorMessage =
    error.details ??
    error.shortMessage ??
    error.data?.message ??
    error.message ??
    error.reason ??
    error.cause ??
    error.toString();

  let errorCode = error?.code ?? error?.response?.data?.code;
  try {
    const { code, message } = JSON.parse(errorMessage);
    if (code) {
      errorCode = code;
    }
    if (message) {
      errorMessage = message;
    }
  } catch {}

  if (errorCode) {
    errorMessage = transformErrorMessage(errorCode, errorMessage);
  }
  return toastCustom("error", errorMessage, {
    autoClose: 10000,
    ...options,
  });
};

export const toastWarn = (
  message: string | React.ReactNode,
  options?: ToastOptions
) => {
  return toastCustom("warning", message, options);
};

export const toastInfo = (
  message: string | React.ReactNode,
  options?: ToastOptions
) => {
  return toastCustom("info", message, options);
};

export const toastSuccess = (
  message: string | React.ReactNode,
  options?: ToastOptions
) => {
  return toastCustom("success", message, options);
};
