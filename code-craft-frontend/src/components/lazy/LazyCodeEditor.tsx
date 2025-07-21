'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Lazy load the Monaco Editor with loading fallback
const CodeEditorContainer = dynamic(
  () => import('@/components/editor/CodeEditorContainer').then(mod => ({ default: mod.CodeEditorContainer })),
  {
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted/50 rounded border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    ),
    ssr: false, // Monaco Editor doesn't work with SSR
  }
);

type LazyCodeEditorProps = ComponentProps<typeof CodeEditorContainer>;

export function LazyCodeEditor(props: LazyCodeEditorProps) {
  return <CodeEditorContainer {...props} />;
}