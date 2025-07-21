"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEditorStore } from "@/stores/editorStore";
import { useAuthStore } from "@/stores/authStore";
import { CodeEditorContainer } from "@/components/editor/CodeEditorContainer";
import { ExecutionPanel } from "@/components/editor/ExecutionPanel";
import { Button } from "@/components/ui/button";
import { useResponsive } from "@/hooks/useResponsive";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { motion } from "framer-motion";
import { Save, Share } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet } = useResponsive();
  const { isAuthenticated } = useAuthStore();
  const { code: storedCode, language: storedLanguage, setCode, setLanguage } = useEditorStore();
  
  // Get language from URL or use stored value
  const languageParam = searchParams.get("language");
  const [code, setLocalCode] = useState(storedCode || "// Write your code here\nconsole.log('Hello, world!');");
  const [language, setLocalLanguage] = useState(
    languageParam || storedLanguage || SUPPORTED_LANGUAGES[0].id
  );
  const [showExecution, setShowExecution] = useState(!isMobile);
  
  // Update editor store when code or language changes
  useEffect(() => {
    setCode(code);
    setLanguage(language);
  }, [code, language, setCode, setLanguage]);
  
  // Update URL when language changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("language", language);
    window.history.replaceState({}, "", url.toString());
  }, [language]);
  
  // Handle code change
  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setLocalCode(value);
    }
  };
  
  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLocalLanguage(newLanguage);
  };
  
  // Toggle execution panel on mobile
  const toggleExecutionPanel = () => {
    setShowExecution(!showExecution);
  };

  // Handle save snippet
  const handleSaveSnippet = () => {
    // Implement save logic
    console.log("Saving snippet:", { code, language });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex h-12 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Select programming language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleExecutionPanel}
            >
              {showExecution ? "Hide Output" : "Show Output"}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSaveSnippet}
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {}}
          >
            <Share className="mr-1 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main editor area */}
        <div className={cn(
          "flex-1 overflow-hidden",
          (isMobile && showExecution) && "hidden"
        )}>
          <CodeEditorContainer
            code={code}
            language={language}
            onChange={handleCodeChange}
            height="100%"
          />
        </div>
        
        {/* Execution panel */}
        {(!isMobile || showExecution) && (
          <motion.div
            className={cn(
              "border-l bg-card",
              isMobile ? "absolute inset-0 z-10" : "w-1/2 desktop:w-2/5"
            )}
            initial={isMobile ? { x: "100%" } : false}
            animate={isMobile ? { x: 0 } : {}}
            transition={{ type: "spring", damping: 25 }}
          >
            <ExecutionPanel
              code={code}
              language={language}
              onSaveSnippet={handleSaveSnippet}
              className="h-full"
            />
            
            {isMobile && (
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={toggleExecutionPanel}
                  size="sm"
                >
                  Back to Editor
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
} 