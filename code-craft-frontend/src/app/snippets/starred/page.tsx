"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { SnippetCard } from "@/components/snippet/SnippetCard";
import { apiClient } from "@/lib/api";
import { useResponsive } from "@/hooks/useResponsive";
import { API_ENDPOINTS } from "@/lib/constants";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export default function StarredSnippetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("");
  const [page, setPage] = useState(1);
  const { isMobile, isTablet } = useResponsive();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  // Redirect if not authenticated
  if (typeof window !== "undefined" && !isAuthenticated) {
    router.push("/login");
    return null;
  }
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["starredSnippets", page, language, searchQuery],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.SNIPPETS.STARRED, {
        params: { page, limit: 12, language, search: searchQuery }
      });
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically run due to the dependency array
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col desktop:flex-row gap-6">
        {/* Filter sidebar - visible on desktop, collapsible on mobile/tablet */}
        <div className={`${isMobile || isTablet ? "hidden" : "w-64"}`}>
          <Card className="p-4 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium mb-1">
                  Language
                </label>
                <select
                  id="language"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="">All Languages</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-heading-3-mobile desktop:text-heading-3-desktop">Starred Snippets</h1>
            
            {/* Mobile/Tablet filter button */}
            {(isMobile || isTablet) && (
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            )}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search starred snippets..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Snippets grid */}
          {isLoading ? (
            <div className="text-center py-10">Loading snippets...</div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              Failed to load snippets. Please try again.
            </div>
          ) : data?.snippets?.length === 0 ? (
            <div className="text-center py-10">
              <p className="mb-4 text-muted-foreground">You haven't starred any snippets yet.</p>
              <Button onClick={() => router.push("/snippets")}>Browse Snippets</Button>
            </div>
          ) : (
            <>
              <div className="responsive-grid">
                {data?.snippets?.map((snippet) => (
                  <SnippetCard key={snippet._id} snippet={snippet} />
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
      </div>
    </div>
  );
} 