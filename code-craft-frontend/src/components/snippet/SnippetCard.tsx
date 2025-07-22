"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MessageSquare, Calendar } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate, truncateText } from "@/lib/utils";
import { SnippetCardProps } from "@/types/ui";
import { staggeredItem } from "@/lib/animations";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { StarButton } from './StarButton';

export function SnippetCard({ snippet, onClick, className }: SnippetCardProps) {
  // Find language info
  const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.id === snippet.programmingLanguage) || 
    SUPPORTED_LANGUAGES[0];
  
  // Format code preview (truncate if needed)
  const codePreview = truncateText(snippet.code, 200);
  
  const commentCount = snippet.commentCount || snippet.comments || 0;
  const starCount = snippet.starCount || snippet.stars || 0;
  
  return (
    <motion.div variants={staggeredItem}>
      <Link href={`/snippets/${snippet._id}`} onClick={onClick}>
        <Card 
          hover 
          className={cn(
            "h-full transition-all duration-300 hover:-translate-y-1",
            className
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {languageInfo.name}
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" fill={snippet.isStarred ? "currentColor" : "none"} />
                  <span>{starCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{commentCount}</span>
                </div>
              </div>
            </div>
            <CardTitle className="line-clamp-1 mt-2 text-lg">
              {snippet.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="h-[120px] overflow-hidden rounded bg-muted p-2">
              <pre className="text-xs">
                <code>{codePreview}</code>
              </pre>
            </div>
          </CardContent>
          
          <CardFooter className="flex items-center justify-between pt-0 text-xs text-muted-foreground">
            <div className="flex items-center">
              <span>By {snippet.userName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              <span>{formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}</span>
            </div>
          </CardFooter>
          
          <CardFooter className="px-4 py-3 border-t flex justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <StarButton snippetId={snippet._id} initialStarCount={starCount} isSmall />
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
} 