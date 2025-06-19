// Sử dụng các import cơ bản
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  User, 
  Network, 
  Settings, 
  Store, 
  BarChart2, 
  BookOpen, 
  Plus, 
  CreditCard,
  Fingerprint, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';

// Tạo một hàm cn đơn giản để thay thế tailwind-merge
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

export function CustomSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  // Sử dụng các hook cơ bản thay vì các hook chưa được định nghĩa
  // const { user } = useAuth();
  // const { theme } = useContext(ThemeContext);
  const user = null; // Tạm thời bỏ qua user

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const sidebarLinks = [
    { 
      group: "MANAGEMENT", 
      items: [
        { href: "/profile", icon: User, label: "Hồ sơ", count: 0 },
        { href: "/network", icon: Network, label: "Mạng", count: 0 },
        { href: "/automation", icon: BarChart2, label: "Tự động hóa", count: 0 },
        { href: "/settings", icon: Settings, label: "Cài đặt", count: 0 },
      ]
    },
    { 
      group: "MARKETPLACE", 
      items: [
        { href: "/store", icon: Store, label: "Cửa hàng", count: 0 },
        { href: "/upgrade", icon: CreditCard, label: "Nâng cấp", count: 0, badge: "PRO" },
        { href: "/deposit", icon: CreditCard, label: "Nạp tiền", count: 0 },
      ]
    },
    { 
      group: "SUPPORT", 
      items: [
        { href: "/guide", icon: BookOpen, label: "Hướng dẫn", count: 0 },
      ]
    }
  ];

  return (
    <div className="relative h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 shadow-sm"
      style={{ width: collapsed ? '5rem' : '16rem' }}>
      <div className="flex flex-col h-full">
        {/* Logo section */}
        <div className="p-4 flex flex-col items-center">
          <div className="flex items-center justify-center">
            <div className={cn("h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white",
              collapsed ? "mx-auto" : "")}>
              <Fingerprint className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="ml-3">
                <h2 className="text-xl font-bold text-blue-600">AntiDetect</h2>
                <p className="text-xs text-gray-500">Browser Management</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <Button 
              variant="default" 
              className="w-full mt-4 bg-blue-500 hover:bg-blue-600 gap-2 text-white"
              onClick={() => {
                // Sử dụng useProfileModalStore để mở modal tạo profile
                // Import từ file useProfileModalStore để sử dụng trực tiếp
                const event = new CustomEvent('openProfileModal');
                document.dispatchEvent(event);
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Create Profile</span>
            </Button>
          )}
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto pt-2">
          {sidebarLinks.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {!collapsed && (
                <h3 className="px-4 mb-2 text-sm font-bold text-gray-500 dark:text-gray-400">{group.group}</h3>
              )}
              <ul>
                {group.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link href={item.href}
                      className={cn(
                        "flex items-center py-2.5 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                        location === item.href && "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500"
                      )}>
                        <div className={cn(
                          "flex items-center gap-3",
                          collapsed && "justify-center w-full"
                        )}>
                          <item.icon className="h-5 w-5" />
                          {!collapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-base font-medium">{item.label}</span>
                              {item.badge && (
                                <span className="px-1.5 py-0.5 text-xs font-semibold bg-yellow-400 text-yellow-800 rounded">
                                  {item.badge}
                                </span>
                              )}
                              {item.count > 0 && (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
                                  {item.count}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Profile info section */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
              {/* Package title */}
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 text-center border-b border-gray-200 dark:border-gray-600">
                <span className="font-bold text-gray-700 dark:text-gray-200">COMMON</span>
              </div>

              {/* Profile limit banner */}
              <div className="bg-blue-100 dark:bg-blue-900/40 py-2 px-4 text-center">
                <span className="text-blue-700 dark:text-blue-300 font-medium text-sm">Dùng 1000 profiles</span>
              </div>

              {/* Stats list */}
              <div className="p-3 space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Hồ sơ đám mây</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">2/5</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Hồ sơ cục bộ</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">0/0</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Thành viên nhóm</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">0/0</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Phiên đăng nhập</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">1/1</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Giới hạn tạo/ngày</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">2/10</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Hết hạn vào</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">2026-05-02</span>
                </div>
              </div>

              {/* Upgrade button */}
              <div className="p-3 pt-1">
                <Button 
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 gap-2 font-medium"
                  variant="default"
                  onClick={() => {
                    window.location.href = "/upgrade";
                  }}
                >
                  <CreditCard className="h-4 w-4" />
                  Nâng cấp
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full p-1 shadow-md z-10"
        >
          {collapsed ? 
            <ChevronRight size={16} className="text-gray-700 dark:text-gray-300" /> : 
            <ChevronLeft size={16} className="text-gray-700 dark:text-gray-300" />
          }
        </button>
      </div>
    </div>
  );
}