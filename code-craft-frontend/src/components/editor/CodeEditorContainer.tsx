"use client";

import React, { useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useTheme } from "next-themes";

import { useResponsive } from "@/hooks/useResponsive";
import { useEditorStore } from "@/stores/editorStore";
import { CodeEditorContainerProps } from "@/types/ui";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

// Configure Monaco loader
loader.config({ monaco });

export function CodeEditorContainer({
  code,
  language,
  onChange,
  readOnly = false,
  height = "70vh",
  theme: propTheme,
  options = {},
}: CodeEditorContainerProps) {
  const { resolvedTheme } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { editorSettings, updateEditorSettings } = useEditorStore();
  const [mounted, setMounted] = useState(false);

  // Determine editor theme
  const editorTheme = propTheme || 
    (resolvedTheme === "dark" ? "vs-dark" : "vs-light");

  // Configure editor options based on device
  const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    ...editorSettings,
    readOnly,
    minimap: {
      enabled: !isMobile && editorSettings.minimap.enabled,
    },
    fontSize: isMobile ? editorSettings.fontSize - 2 : editorSettings.fontSize,
    wordWrap: isMobile ? "on" : editorSettings.wordWrap,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: editorSettings.tabSize,
    lineNumbers: isMobile ? "off" : editorSettings.lineNumbers,
  };

  const editorOptions = {
    ...defaultOptions,
    ...options,
  };

  // Handle editor mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    setMounted(true);
    
    // Configure editor for touch devices
    if (isMobile) {
      editor.updateOptions({
        fontSize: editorSettings.fontSize - 2,
        lineNumbers: "off",
        folding: false,
        glyphMargin: false,
        lineDecorationsWidth: 10,
      });
    }

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Trigger save action
      console.log("Save shortcut triggered");
    });

    // Set focus if not read-only
    if (!readOnly) {
      editor.focus();
    }

    // Set accessibility attributes
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.setAttribute('aria-roledescription', 'code editor');
      editorDomNode.setAttribute('aria-label', `${language} code editor`);
    }
  };

  // Update editor settings when device type changes
  useEffect(() => {
    if (!mounted) return;
    
    updateEditorSettings({
      minimap: {
        enabled: !isMobile && editorSettings.minimap.enabled,
      },
      fontSize: isMobile ? editorSettings.fontSize - 2 : editorSettings.fontSize,
      wordWrap: isMobile ? "on" : editorSettings.wordWrap,
      lineNumbers: isMobile ? "off" : editorSettings.lineNumbers,
    });
  }, [isMobile, isTablet, mounted, editorSettings.fontSize, editorSettings.minimap.enabled, editorSettings.wordWrap, editorSettings.lineNumbers, updateEditorSettings]);

  // Get language configuration
  const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.id === language) || 
    SUPPORTED_LANGUAGES[0];

  return (
    <div 
      className="relative h-full w-full rounded-md border overflow-hidden"
      aria-roledescription="code editor"
      aria-label={`${language} code editor`}
    >
      {mounted && (
        <Editor
          height={height}
          language={language}
          value={code}
          theme={editorTheme}
          options={editorOptions}
          onChange={value => onChange(value || "")}
          onMount={handleEditorDidMount}
          loading={<div className="flex h-full w-full items-center justify-center">Loading editor...</div>}
          className="rounded-md"
        />
      )}
    </div>
  );
} 