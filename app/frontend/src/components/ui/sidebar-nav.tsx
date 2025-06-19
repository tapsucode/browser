import React from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Globe,
  Settings,
  Store,
  Crown,
  Wallet,
  HelpCircle,
  Cog,
  Zap,
  Layers,
  ChevronRight,
  X,
  PlusCircle
} from "lucide-react";

interface SidebarNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function SidebarNav({ isOpen, setIsOpen }: SidebarNavProps) {
  const [location, navigate] = useLocation();

  const onNavItemClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const navItems = [
    {
      title: "Profiles",
      icon: <User className="h-5 w-5" />,
      path: "/",
      active: location === "/",
      badge: "4"
    },
    {
      title: "Network",
      icon: <Globe className="h-5 w-5" />,
      path: "/network",
      active: location === "/network",
      badge: "12"
    },
    {
      title: "Automation",
      icon: <Zap className="h-5 w-5" />,
      path: "/automation",
      active: location === "/automation",
    },
    {
      title: "Settings",
      icon: <Cog className="h-5 w-5" />,
      path: "/settings",
      active: location === "/settings",
    },
  ];

  const marketplaceItems = [
    {
      title: "Store",
      icon: <Store className="h-5 w-5" />,
      path: "/store",
      active: location === "/store",
    },
    {
      title: "Upgrade Plan",
      icon: <Crown className="h-5 w-5" />,
      path: "/upgrade",
      active: location === "/upgrade",
      badge: "PRO"
    },
    {
      title: "Deposit",
      icon: <Wallet className="h-5 w-5" />,
      path: "/deposit",
      active: location === "/deposit",
    },
  ];

  const supportItems = [
    {
      title: "Guide",
      icon: <HelpCircle className="h-5 w-5" />,
      path: "/guide",
      active: location === "/guide",
      badge: null,
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-y-auto h-[calc(100vh-4rem)] fixed lg:relative z-50",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="ml-2 text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AntiDetect
          </span>
        </div>
        <button 
          className="text-gray-500 hover:text-gray-900" 
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="px-4 py-2">
        <div className="relative mt-2 mb-4">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-medium"
            onClick={() => onNavItemClick("/")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Profile
          </Button>
        </div>

        <nav className="space-y-8">
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Management
            </h3>
            <div className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg cursor-pointer",
                    item.active
                      ? "bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => onNavItemClick(item.path)}
                >
                  <div className="flex items-center">
                    <span className={cn(
                      "mr-3",
                      item.active 
                        ? "text-primary" 
                        : "text-gray-500 group-hover:text-gray-700"
                    )}>
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  
                  {item.badge && (
                    <Badge variant={item.active ? "default" : "outline"} className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Marketplace
            </h3>
            <div className="space-y-1">
              {marketplaceItems.map((item) => (
                <a
                  key={item.path}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg cursor-pointer",
                    item.active
                      ? "bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => onNavItemClick(item.path)}
                >
                  <div className="flex items-center">
                    <span className={cn(
                      "mr-3",
                      item.active 
                        ? "text-primary" 
                        : "text-gray-500 group-hover:text-gray-700"
                    )}>
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  
                  {item.badge && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Support
            </h3>
            <div className="space-y-1">
              {supportItems.map((item) => (
                <a
                  key={item.path}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg cursor-pointer",
                    item.active
                      ? "bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => onNavItemClick(item.path)}
                >
                  <div className="flex items-center">
                    <span className={cn(
                      "mr-3",
                      item.active 
                        ? "text-primary" 
                        : "text-gray-500 group-hover:text-gray-700"
                    )}>
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  
                  {item.badge && (
                    <Badge variant={item.active ? "default" : "outline"} className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="px-4 mt-6 mb-6">
        <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Available Credits</h4>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">Premium</Badge>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-bold text-primary">250</span>
            <span className="text-sm text-gray-500 ml-1">credits</span>
          </div>
          <div className="mt-3 flex space-x-2">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
              onClick={() => onNavItemClick("/deposit")}
            >
              Buy More
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-gray-200"
              onClick={() => onNavItemClick("/upgrade")}
            >
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
