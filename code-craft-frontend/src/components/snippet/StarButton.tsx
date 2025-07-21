"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface StarButtonProps {
  snippetId: string;
  initialStarCount: number;
  isStarred?: boolean;
  isSmall?: boolean;
  className?: string;
}

export function StarButton({
  snippetId,
  initialStarCount = 0,
  isStarred: initialIsStarred = false,
  isSmall = false,
  className,
}: StarButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [isStarred, setIsStarred] = useState(initialIsStarred);
  const [starCount, setStarCount] = useState(initialStarCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const queryClient = useQueryClient();

  // Star mutation
  const starMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.post(API_ENDPOINTS.STARS.TOGGLE(snippetId));
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["snippet", snippetId] });
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      queryClient.invalidateQueries({ queryKey: ["starredSnippets"] });
    },
    onError: () => {
      // Revert optimistic update
      setIsStarred(!isStarred);
      setStarCount(isStarred ? starCount + 1 : starCount - 1);
      toast.error("Failed to update star");
    },
  });

  const handleToggleStar = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to star snippets");
      return;
    }

    // Optimistic update
    setIsStarred(!isStarred);
    setStarCount(isStarred ? starCount - 1 : starCount + 1);
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);
    
    // Call API
    starMutation.mutate();
  };

  return (
    <Button
      variant="ghost"
      size={isSmall ? "sm" : "default"}
      onClick={handleToggleStar}
      className={cn(
        "relative flex items-center gap-2",
        isStarred && "text-warning",
        className
      )}
      aria-label={isStarred ? "Unstar snippet" : "Star snippet"}
      aria-pressed={isStarred}
      disabled={starMutation.isPending}
    >
      <div className="relative">
        <Star
          className={cn(
            "h-4 w-4",
            isStarred && "fill-current"
          )}
        />
        
        {/* Star burst animation */}
        <AnimatePresence>
          {isAnimating && isStarred && (
            <>
              {/* Outer burst */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warning/30"
              />
              
              {/* Inner burst */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warning/50"
              />
              
              {/* Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    x: Math.cos(i * (Math.PI / 3)) * 15, 
                    y: Math.sin(i * (Math.PI / 3)) * 15,
                    scale: 1,
                    opacity: 0 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warning"
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
      
      <span className="text-sm">{starCount}</span>
    </Button>
  );
} 