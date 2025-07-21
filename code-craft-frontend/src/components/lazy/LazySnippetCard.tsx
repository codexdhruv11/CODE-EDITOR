'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Lazy load SnippetCard for better performance
const SnippetCard = dynamic(
  () => import('@/components/snippet/SnippetCard').then(mod => ({ default: mod.SnippetCard })),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="flex justify-between">
            <div className="h-3 bg-muted rounded w-1/4"></div>
            <div className="h-3 bg-muted rounded w-1/4"></div>
          </div>
        </div>
      </div>
    ),
  }
);

type LazySnippetCardProps = ComponentProps<typeof SnippetCard>;

export function LazySnippetCard(props: LazySnippetCardProps) {
  return <SnippetCard {...props} />;
}