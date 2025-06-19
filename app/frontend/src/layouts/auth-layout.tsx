import React, { ReactNode } from "react";
import { Globe, ShieldCheck, Fingerprint } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Main container - responsive 8-4 layout */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-8 items-start">
        {/* Left panel - responsive 8 columns with min/max height - Blue Image Area */}
        <div className="md:col-span-8 hidden md:block">
          {/* Actual content container with responsive height and width */}
          <div className="min-h-[700px] max-h-[calc(100vh-80px)] h-[85vh] bg-gradient-to-br from-blue-800 to-indigo-900 rounded-xl shadow-xl overflow-hidden relative">
            {/* Logo at the top - responsive positioning */}
            <div className="absolute top-4 md:top-6 lg:top-8 left-4 md:left-6 lg:left-8 flex items-center z-10">
              <div className="h-10 md:h-12 w-10 md:w-12 bg-white/10 rounded-full flex items-center justify-center">
                <Fingerprint className="h-6 md:h-7 w-6 md:w-7 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-xl md:text-2xl font-bold text-white">hidemium</h2>
                <p className="text-xs text-white/70">Anti-detect browser management</p>
              </div>
            </div>
            
            {/* Center content container - responsive padding and sizing */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex flex-col items-center p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="w-full flex flex-col items-center justify-center max-w-lg">
                {/* Product showcase image - responsive margins */}
                <div className="w-full rounded-lg overflow-hidden border border-white/20 shadow-xl mb-6 md:mb-8">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
                    alt="Product Screenshot" 
                    className="w-full"
                  />
                </div>
                
                {/* Product tagline - responsive text sizes */}
                <div className="text-center mb-6 md:mb-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3">"Market Script"</h3>
                  <p className="text-sm md:text-base text-white/80">
                    Thousands of cross-platform scripts are available on our app market.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature points at the bottom - responsive spacing */}
            <div className="absolute bottom-6 md:bottom-8 lg:bottom-12 left-6 md:left-8 lg:left-12 right-6 md:right-8 lg:right-12 z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center md:space-x-8 space-y-4 md:space-y-0">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white/10 p-2 rounded-lg">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-md font-semibold text-white">Multiple Browsers</h4>
                    <p className="mt-1 text-xs text-white/70">Create and manage browser profiles</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white/10 p-2 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-md font-semibold text-white">Advanced Protection</h4>
                    <p className="mt-1 text-xs text-white/70">Mask your browser fingerprint</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative curved line */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-40">
                <path
                  d="M0,150 C150,50 350,50 500,150 L500,00 L0,0 Z"
                  className="fill-blue-700/30"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Right panel - responsive 4 columns - Form Area with matching height */}
        <div className="col-span-1 md:col-span-4 flex items-center justify-center min-h-[700px] max-h-[calc(100vh-80px)] h-[85vh]">
          {/* Form container with responsive padding */}
          <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 py-8 md:py-10 px-6 md:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
