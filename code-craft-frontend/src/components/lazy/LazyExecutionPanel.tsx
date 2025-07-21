'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Lazy load ExecutionPanel for better performance
const ExecutionPanel = dynamic(
  () => import('@/components/editor/ExecutionPanel').then(mod => ({ default: mod.ExecutionPanel })),
  {
    loading: () => (
      <div className="h-full flex items-center justify-center bg-muted/50 rounded border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading execution panel...</p>
        </div>
      </div>
    ),
  }
);

type LazyExecutionPanelProps = ComponentProps<typeof ExecutionPanel>;

export function LazyExecutionPanel(props: LazyExecutionPanelProps) {
  return <ExecutionPanel {...props} />;
}