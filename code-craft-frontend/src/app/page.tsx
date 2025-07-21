"use client";

import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="mb-4 text-center">
          Welcome to Code-Craft
        </h1>
        
        <p className="mb-8 text-center text-muted-foreground">
          A modern code editor with support for multiple languages
        </p>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Link 
            href="/editor"
            className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <h2 className="mb-2 text-lg font-medium">Code Editor</h2>
            <p className="text-sm text-muted-foreground">Write and execute code in 10+ languages</p>
          </Link>
          
          <Link 
            href="/snippets"
            className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <h2 className="mb-2 text-lg font-medium">Snippets</h2>
            <p className="text-sm text-muted-foreground">Browse and save code snippets</p>
          </Link>
          
          <Link 
            href="/login"
            className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <h2 className="mb-2 text-lg font-medium">Login</h2>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </Link>
        </div>
      </div>
    </main>
  );
} 