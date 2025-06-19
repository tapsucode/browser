// Đơn giản hóa hook toast để sử dụng trong dự án
import { useState } from "react";

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useToast() {
  // Toast state
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Function to show toast
  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 10);
    const newToast = {
      ...props,
      id,
      duration: props.duration || 3000
    };
    
    setToasts((prev) => [...prev, newToast]);

    // Automatically remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => (t as any).id !== id));
    }, props.duration || 3000);
  };

  return {
    toast,
    toasts
  };
}