'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Terminal, Check, X, Save, Play, Clock } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

export default function ExecutionsPage() {
  const [page, setPage] = useState(1);
  const [language, setLanguage] = useState('');
  const { isMobile, isTablet } = useResponsive();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['executions', page, language],
    queryFn: async () => {
      // This would be replaced with actual API call
      return {
        executions: [
          {
            id: '1',
            language: 'javascript',
            code: 'console.log("Hello, world!");',
            status: 'success',
            output: 'Hello, world!',
            executionTime: 0.12,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            language: 'python',
            code: 'print("Hello, world!")',
            status: 'success',
            output: 'Hello, world!',
            executionTime: 0.08,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            language: 'javascript',
            code: 'console.log(x);',
            status: 'error',
            output: 'ReferenceError: x is not defined',
            executionTime: 0.05,
            createdAt: new Date().toISOString()
          }
        ],
        hasMore: false
      };
    }
  });

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderStatusIcon = (status: string) => {
    if (status === 'success') {
      return <Check className="h-4 w-4 text-success" />;
    } else {
      return <X className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading-2-mobile desktop:text-heading-2-desktop">Execution History</h1>
        
        <div className="flex items-center">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 mr-2"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="">All Languages</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading execution history...</div>
      ) : error ? (
        <div className="text-center py-10 text-destructive">
          Failed to load execution history. Please try again.
        </div>
      ) : data?.executions.length === 0 ? (
        <Card className="p-6 text-center">
          <Terminal className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No executions yet</h2>
          <p className="text-muted-foreground mb-4">
            When you run code, your execution history will appear here.
          </p>
          <Button>Go to Editor</Button>
        </Card>
      ) : (
        <>
          {/* Desktop table view */}
          {!isMobile && !isTablet && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Language</th>
                    <th className="text-left py-3 px-4">Code Preview</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Time</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.executions.map((execution) => (
                    <tr key={execution.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="capitalize">{execution.language}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-[300px] truncate font-mono text-sm">
                          {execution.code}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {renderStatusIcon(execution.status)}
                          <span className="ml-2 capitalize">{execution.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {execution.executionTime.toFixed(2)}s
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(execution.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-1" />
                            Re-run
                          </Button>
                          <Button size="sm" variant="outline">
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile/Tablet card view */}
          {(isMobile || isTablet) && (
            <div className="space-y-4">
              {data?.executions.map((execution) => (
                <Card key={execution.id} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="font-medium capitalize mr-2">{execution.language}</span>
                      {renderStatusIcon(execution.status)}
                      <span className="ml-1 text-sm capitalize">{execution.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(execution.createdAt)}
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md mb-3 font-mono text-sm overflow-x-auto">
                    {execution.code}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {execution.executionTime.toFixed(2)}s
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                        <span className="sr-only">Re-run</span>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Save className="h-4 w-4" />
                        <span className="sr-only">Save</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

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