'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Editor } from '@monaco-editor/react';
import { StarButton } from '@/components/snippet/StarButton';
import { Calendar, User, Code, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

export default function SnippetDetailPage() {
  const params = useParams();
  const snippetId = params.id as string;
  const { user } = useAuth();
  
  const { data: snippet, isLoading: snippetLoading, error: snippetError } = useQuery({
    queryKey: ['snippet', snippetId],
    queryFn: async () => {
      // This would be replaced with actual API call
      return {
        id: snippetId,
        title: 'Example Snippet',
        code: 'console.log("Hello, world!");',
        language: 'javascript',
        createdAt: new Date().toISOString(),
        user: { id: '123', name: 'John Doe' },
        stars: 5,
        comments: []
      };
    }
  });

  const isOwner = user?.id === snippet?.user.id;

  if (snippetLoading) {
    return <div className="container py-8">Loading snippet...</div>;
  }

  if (snippetError) {
    return <div className="container py-8 text-destructive">Failed to load snippet. Please try again.</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col desktop:flex-row gap-6">
        {/* Main content - code display */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-heading-2-mobile desktop:text-heading-2-desktop">{snippet.title}</h1>
            <StarButton snippetId={snippetId} initialStarCount={snippet.stars} />
          </div>
          
          <Card className="mb-6">
            <div className="h-[500px] w-full">
              <Editor
                height="100%"
                defaultLanguage={snippet.language}
                defaultValue={snippet.code}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                }}
              />
            </div>
          </Card>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex gap-4 mb-6">
              <Button variant="outline">Edit Snippet</Button>
              <Button variant="destructive">Delete Snippet</Button>
            </div>
          )}

          {/* Comments section */}
          <div className="mt-8">
            <h2 className="text-heading-3-mobile desktop:text-heading-3-desktop mb-4">Comments</h2>
            
            {/* Comment form */}
            <Card className="p-4 mb-6">
              <textarea 
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                placeholder="Add a comment..."
              />
              <div className="flex justify-end mt-2">
                <Button>Post Comment</Button>
              </div>
            </Card>

            {/* Comments list */}
            {snippet.comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="space-y-4">
                {/* Comments would be mapped here */}
                <Card className="p-4">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">User Name</div>
                    <div className="text-sm text-muted-foreground">2 days ago</div>
                  </div>
                  <p>This is a great snippet! Thanks for sharing.</p>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - metadata */}
        <div className="desktop:w-80">
          <Card className="p-4 sticky top-20">
            <h2 className="font-semibold mb-4">Snippet Details</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Created by {snippet.user.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center">
                <Code className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Language: {snippet.language}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{snippet.comments.length} comments</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 