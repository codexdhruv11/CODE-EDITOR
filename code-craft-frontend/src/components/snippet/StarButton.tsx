"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

import { cn } from "@/lib/utils";
import { StarButtonProps } from "@/types/ui";
import { starApi } from "@/lib/api";

export function StarButton({
  snippetId,
  initialStarCount,
  isSmall = false,
}: StarButtonProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(initialStarCount);
  const queryClient = useQueryClient();

  const { mutate: toggleStar, isPending } = useMutation({
    mutationFn: async () => {
      // This would be replaced with actual API call
      // e.g. await axios.post(`/api/stars/snippets/${snippetId}/stars`);
      return { success: true };
    },
    onMutate: () => {
      // Optimistic update
      setIsStarred((prev) => !prev);
      setStarCount((prev) => (isStarred ? prev - 1 : prev + 1));
    },
    onError: () => {
      // Rollback on error
      setIsStarred((prev) => !prev);
      setStarCount((prev) => (isStarred ? prev + 1 : prev - 1));
    },
    onSettled: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['snippet', snippetId] });
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation();
    if (!isPending) {
      toggleStar();
    }
  };

  return (
    <Button
      variant="ghost"
      size={isSmall ? 'sm' : 'default'}
      className={cn(
        'group flex items-center gap-1 p-1',
        isStarred ? 'text-warning' : 'text-muted-foreground'
      )}
      onClick={handleClick}
      aria-label={isStarred ? 'Unstar this snippet' : 'Star this snippet'}
      aria-pressed={isStarred}
      disabled={isPending}
    >
      <Star
        className={cn(
          'transition-transform',
          isStarred ? 'fill-warning' : 'fill-none',
          isSmall ? 'h-4 w-4' : 'h-5 w-5'
        )}
      />
      <span className={isSmall ? 'text-xs' : 'text-sm'}>{starCount}</span>
      
      {/* Visually hidden announcement for screen readers */}
      <span className="sr-only" aria-live="polite">
        {isStarred ? 'Snippet starred' : 'Snippet unstarred'}
      </span>
    </Button>
  );
} 