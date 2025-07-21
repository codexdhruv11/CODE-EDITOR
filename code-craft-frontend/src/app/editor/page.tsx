"use client";

import React, { useState } from "react";
import Link from "next/link";

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'csharp', name: 'C#' },
];

export default function EditorPage() {
  const [code, setCode] = useState("// Write your code here\nconsole.log('Hello, world!');");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };
  
  // Handle code execution
  const handleExecuteCode = () => {
    setIsExecuting(true);
    setOutput("");
    
    // Simulate API call with timeout
    setTimeout(() => {
      setOutput(`Output from ${language} code execution:\n${code.slice(0, 100)}...\n\nExecution completed successfully.`);
      setIsExecuting(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Code Editor</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={language}
            onChange={handleLanguageChange}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Select programming language"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          
          <button 
            onClick={handleExecuteCode}
            disabled={isExecuting}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isExecuting ? "Running..." : "Run"}
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2">
        {/* Editor panel */}
        <div className="rounded-md border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium">Code</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-[calc(100vh-12rem)] w-full rounded-md border border-input bg-background p-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            spellCheck="false"
          />
        </div>
        
        {/* Output panel */}
        <div className="rounded-md border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium">Output</h2>
          <div className="h-[calc(100vh-12rem)] w-full overflow-auto rounded-md border border-input bg-background p-2 font-mono text-sm">
            {isExecuting ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="ml-2">Executing code...</span>
              </div>
            ) : output ? (
              <pre>{output}</pre>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <p>Click the Run button to execute your code</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </footer>
    </div>
  );
} 