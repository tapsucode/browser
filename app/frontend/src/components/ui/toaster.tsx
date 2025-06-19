import React from "react";
import { useToast } from "../../hooks/use-toast";

export const Toaster = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-72">
      {toasts.map((toast: any) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-md ${
            toast.variant === "destructive"
              ? "bg-red-500 text-white"
              : toast.variant === "success"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          } transition-all duration-300 animate-in fade-in slide-in-from-right`}
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-medium">{toast.title}</h3>
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};