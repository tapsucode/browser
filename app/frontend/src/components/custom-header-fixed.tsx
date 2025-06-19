import React, { useState, useContext } from "react";
import { useLocation } from "wouter";
import { cn } from "../lib/utils";
import {
  Bell,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  User,
  Settings,
  CreditCard,
  Info,
  Home,
  Network,
  FileText,
  Package,
  Store,
  LayoutList,
} from "lucide-react";
import { ThemeContext } from "../layouts/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/us/useAuth";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function CustomHeader() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return "?";

    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }

    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }

    return "U";
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/auth'; // Redirect sau khi logout thành công
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Function to get current page name and icon
  const getCurrentPage = () => {
    const [location] = useLocation();
    const path = location || "";

    if (path === "/")
      return { name: "Trang chủ", icon: <Home className="h-5 w-5 mr-2" /> };
    if (path === "/profile")
      return { name: "Hồ sơ", icon: <User className="h-5 w-5 mr-2" /> };
    if (path === "/network")
      return { name: "Mạng lưới", icon: <Network className="h-5 w-5 mr-2" /> };
    if (path === "/automation")
      return {
        name: "Tự động hóa",
        icon: <LayoutList className="h-5 w-5 mr-2" />,
      };
    if (path === "/store")
      return { name: "Cửa hàng", icon: <Store className="h-5 w-5 mr-2" /> };
    if (path === "/deposit")
      return {
        name: "Nạp tiền",
        icon: <CreditCard className="h-5 w-5 mr-2" />,
      };
    if (path === "/guide")
      return { name: "Hướng dẫn", icon: <FileText className="h-5 w-5 mr-2" /> };
    if (path === "/settings")
      return { name: "Cài đặt", icon: <Settings className="h-5 w-5 mr-2" /> };

    return { name: "Trang khác", icon: <Package className="h-5 w-5 mr-2" /> };
  };

  const currentPage = getCurrentPage();

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-2 px-4">
      <div className="flex items-center justify-between">
        {/* Current page indicator */}
        <div className="flex items-center">
          <div className="flex items-center py-2 px-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
            {currentPage.icon}
            <span className="font-medium text-blue-700 dark:text-blue-300">
              {currentPage.name}
            </span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-gray-600" />
            ) : (
              <Sun className="h-5 w-5 text-gray-400" />
            )}
          </Button>

          {/* Balance */}
          <div className="hidden md:flex items-center space-x-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-100 dark:border-blue-800">
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              250,000 đ
            </span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">
              3
            </span>
          </Button>

          {/* User menu */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium dark:text-white">
                    {user?.username || "User"}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    Premium Plan
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-500 transition-transform",
                    isDropdownOpen && "rotate-180",
                  )}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {user?.username || "User"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.firstName || ""} {user?.lastName || "Premium User"}
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/profile">
                  <div className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2" />
                    <span>Thông tin tài khoản</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/settings">
                  <div className="flex items-center w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Cài đặt</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/deposit">
                  <div className="flex items-center w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Nạp tiền</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/guide">
                  <div className="flex items-center w-full">
                    <Info className="h-4 w-4 mr-2" />
                    <span>Hỗ trợ</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
