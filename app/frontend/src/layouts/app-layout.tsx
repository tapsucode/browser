import React, { ReactNode, createContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CustomSidebar } from "@/components/custom-sidebar";
import { CustomHeader } from "@/components/custom-header-fixed";
import { useAuth } from "@/hooks/us/useAuth";

// Create Theme Context
export type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize theme from localStorage if available
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // Redirect if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar (left side) */}
        <CustomSidebar />

        {/* Main content area with header */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Header */}
          <CustomHeader />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
