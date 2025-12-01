"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface ShellProps {
  children: ReactNode;
  title?: string;
}

export function Shell({ children, title = "Camoufox Control Panel" }: ShellProps) {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Topbar title={title} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
