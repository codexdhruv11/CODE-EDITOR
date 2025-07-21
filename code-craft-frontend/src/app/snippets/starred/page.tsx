'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { SnippetCard } from '@/components/snippet/SnippetCard';
import { useResponsive } from '@/hooks/useResponsive';

export default function StarredSnippetsPage() {
  const [page, setPage] = useState(1);
  const { isMobile } = useResponsive();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['snippets', 'starred', page],
    queryFn: async () => {
      // This would be replaced with actual API call
      return {
        snippets: [
          {
            id: '1',
            title: 'Example Starred Snippet',
            language: 'javascript',
            createdAt: new Date().toISOString(),
            user: { name: 'John Doe' },
            stars: 5,
            commentCount: 2
          }
        ],
        hasMore: false
      };
    }
  });

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Star className="h-6 w-6 mr-2 text-warning" fill="currentColor" />
        <h1 className="text-heading-3-mobile desktop:text-heading-3-desktop">Starred Snippets</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading starred snippets...</div>
      ) : error ? (
        <div className="text-center py-10 text-destructive">
          Failed to load starred snippets. Please try again.
        </div>
      ) : data?.snippets?.length === 0 ? (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No starred snippets yet</h2>
          <p className="text-muted-foreground mb-4">
            When you star snippets, they'll appear here for quick access.
          </p>
          <Button>Browse Snippets</Button>
        </Card>
      ) : (
        <>
          <div className="responsive-grid">
            {data?.snippets?.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>

          {/* Load more button */}
          {data?.hasMore && (
            <div className="mt-8 text-center">
              <Button onClick={handleLoadMore} disabled={isLoading}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 