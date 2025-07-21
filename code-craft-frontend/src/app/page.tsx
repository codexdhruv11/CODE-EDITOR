"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Snippet } from "@/types/api";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  
  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch recent snippets
  const { data: recentSnippets } = useQuery({
    queryKey: ["recentSnippets"],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await apiClient.get(`${API_ENDPOINTS.SNIPPETS.BASE}?limit=6`);
      return response.data.data as Snippet[];
    },
    enabled: isAuthenticated && isClient,
  });

  // Fetch execution stats
  const { data: executionStats } = useQuery({
    queryKey: ["executionStats"],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      const response = await apiClient.get(API_ENDPOINTS.EXECUTIONS.STATS);
      return response.data;
    },
    enabled: isAuthenticated && isClient,
  });

  // Show loading during hydration or auth initialization
  if (!isClient || isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  // If not authenticated, show landing page
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 tablet:p-8 desktop:p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between">
          <h1 className="mb-4 text-center text-heading-1-mobile tablet:text-heading-1-desktop">
            Welcome to Code-Craft
          </h1>
          
          <p className="mb-8 text-center text-body-large text-muted-foreground">
            A modern code editor with support for multiple languages
          </p>
          
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Code Editor</CardTitle>
                <CardDescription>Write and execute code in 10+ languages</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => router.push("/login")} className="w-full">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Snippets</CardTitle>
                <CardDescription>Browse and save code snippets</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
                  Explore Snippets
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Community</CardTitle>
                <CardDescription>Share and discover code with others</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" onClick={() => router.push("/register")} className="w-full">
                  Join Now
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated dashboard
  return (
    <main className="container mx-auto p-4 tablet:p-6 desktop:p-8" id="main-content">
      <div className="grid grid-cols-1 gap-6 desktop:grid-cols-3">
        <div className="desktop:col-span-2">
          <h1 className="mb-6 text-heading-1-mobile tablet:text-heading-1-desktop">
            Welcome back, {user?.name?.split(' ')[0] || 'Coder'}
          </h1>
          
          <div className="mb-8 flex flex-wrap gap-4">
            <Button size="lg" onClick={() => router.push("/editor")}>
              New Snippet
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/snippets")}>
              Browse Snippets
            </Button>
          </div>
          
          <div className="mb-8">
            <h2 className="mb-4 text-heading-3-mobile tablet:text-heading-3-desktop">
              Recent Snippets
            </h2>
            
            {recentSnippets?.length ? (
              <div className="responsive-grid">
                {recentSnippets.map((snippet) => (
                  <Card key={snippet._id} className="card-hover">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{snippet.title}</CardTitle>
                      <CardDescription>
                        {snippet.language} • {new Date(snippet.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="line-clamp-3 overflow-hidden rounded bg-muted p-2 text-xs">
                        <code>{snippet.code.slice(0, 150)}...</code>
                      </pre>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={`/snippets/${snippet._id}`}>View Snippet</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No snippets yet</CardTitle>
                  <CardDescription>
                    Create your first snippet to get started
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => router.push("/editor")} className="w-full">
                    Create Snippet
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Execution Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {executionStats ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Executions</span>
                    <span className="font-medium">{executionStats.totalExecutions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Successful</span>
                    <span className="font-medium text-success">{executionStats.successfulExecutions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed</span>
                    <span className="font-medium text-destructive">{executionStats.failedExecutions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Execution Time</span>
                    <span className="font-medium">{executionStats.averageExecutionTime?.toFixed(2) || 0} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Most Used Language</span>
                    <span className="font-medium">{executionStats.mostUsedLanguage || 'None'}</span>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground">No executions yet</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 