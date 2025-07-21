"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { User, Trash2, Edit } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS, API_LIMITS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface CommentListProps {
  snippetId: string;
}

export function CommentList({ snippetId }: CommentListProps) {
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data, isLoading } = useQuery({
    queryKey: ["comments", snippetId],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.COMMENTS.LIST(snippetId));
      return response.data;
    },
  });

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      return await apiClient.post(API_ENDPOINTS.COMMENTS.LIST(snippetId), { content });
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", snippetId] });
      toast.success("Comment added");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  // Update comment mutation
  const updateComment = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      return await apiClient.patch(API_ENDPOINTS.COMMENTS.DETAIL(commentId), { content });
    },
    onSuccess: () => {
      setEditingCommentId(null);
      queryClient.invalidateQueries({ queryKey: ["comments", snippetId] });
      toast.success("Comment updated");
    },
    onError: () => {
      toast.error("Failed to update comment");
    },
  });

  // Delete comment mutation
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      return await apiClient.delete(API_ENDPOINTS.COMMENTS.DETAIL(commentId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", snippetId] });
      toast.success("Comment deleted");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  // Handle comment submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment.mutate(comment);
  };

  // Handle edit start
  const handleEditStart = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  // Handle edit save
  const handleEditSave = (commentId: string) => {
    if (!editingContent.trim()) return;
    updateComment.mutate({ commentId, content: editingContent });
  };

  // Handle comment delete
  const handleDelete = (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment.mutate(commentId);
    }
  };

  const comments = data?.comments || [];
  const commentCount = data?.total || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments ({commentCount})</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Comment form for authenticated users */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={API_LIMITS.COMMENT_MAX_LENGTH}
              className="min-h-[100px]"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {comment.length}/{API_LIMITS.COMMENT_MAX_LENGTH}
              </span>
              <Button 
                type="submit" 
                disabled={!comment.trim() || addComment.isPending}
                aria-busy={addComment.isPending}
              >
                {addComment.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">Sign in to leave a comment</p>
            <Button onClick={() => window.location.href = "/login"}>
              Sign In
            </Button>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-4 mt-6">
          {isLoading ? (
            <p className="text-center py-4">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <AnimatePresence>
              {comments.map((comment: any) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border rounded-md p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">{comment.author.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {editingCommentId === comment._id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        maxLength={API_LIMITS.COMMENT_MAX_LENGTH}
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCommentId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditSave(comment._id)}
                          disabled={updateComment.isPending}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p>{comment.content}</p>
                  )}

                  {/* Comment actions for author */}
                  {user?._id === comment.author._id && editingCommentId !== comment._id && (
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(comment._id, comment.content)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(comment._id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>

      {comments.length > 0 && data?.hasMore && (
        <CardFooter>
          <Button variant="outline" className="w-full">
            Load More Comments
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 