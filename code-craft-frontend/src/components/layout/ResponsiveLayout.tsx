"use client";

import React, { useEffect, ReactNode } from "react";
import { motion } from "framer-motion";

import { useResponsive } from "@/hooks/useResponsive";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { ResponsiveLayoutProps } from "@/types/ui";
import { MobileBottomNav } from './MobileBottomNav';

export function ResponsiveLayout({
  children,
  sidebar,
  header,
  footer,
  hideHeaderOnMobile = false,
  showMobileNav = true,
  className,
}: ResponsiveLayoutProps) {
  const { breakpoint, isMobile, isTablet } = useResponsive();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  
  // Close sidebar on mobile/tablet when breakpoint changes
  useEffect(() => {
    if (breakpoint !== "desktop" && isSidebarOpen) {
      setSidebarOpen(false);
    }
  }, [breakpoint, isSidebarOpen, setSidebarOpen]);

  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {/* Header */}
      {header && (
        <header
          className={cn(
            "sticky top-0 z-40 w-full border-b bg-background",
            hideHeaderOnMobile && breakpoint === "mobile" && "hidden"
          )}
        >
          {header}
        </header>
      )}

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar - Desktop */}
        {sidebar && breakpoint === "desktop" && (
          <aside
            className={cn(
              "hidden w-64 flex-shrink-0 border-r bg-card desktop:block",
              isSidebarOpen ? "desktop:block" : "desktop:hidden"
            )}
          >
            {sidebar}
          </aside>
        )}

        {/* Sidebar - Mobile/Tablet Overlay */}
        {sidebar && breakpoint !== "desktop" && isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-card"
            >
              {sidebar}
            </motion.aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="border-t bg-background">
          {footer}
        </footer>
      )}

      {showMobileNav && isMobile && <MobileBottomNav />}
    </div>
  );
} 