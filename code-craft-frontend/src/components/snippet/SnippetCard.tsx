"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MessageSquare, Calendar } from "lucide-react";
import { useRelativeDate } from "@/lib/date-utils";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate, truncateText } from "@/lib/utils";
import { SnippetCardProps } from "@/types/ui";
import { staggeredItem } from "@/lib/animations";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { StarButton } from './StarButton';

export function SnippetCard({ snippet, onClick, className }: SnippetCardProps) {
  // Find language info
  const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.id === snippet.language) || 
    SUPPORTED_LANGUAGES[0];
  
  // Format code preview (truncate if needed)
  const codePreview = truncateText(snippet.code, 200);
  
  // Use snippet properties
  const commentCount = snippet.comments || 0;
  const starCount = snippet.stars || 0;
  const userName = snippet.author ? snippet.author.name : "Unknown";
  
  // Get hydration-safe relative date
  const relativeDate = useRelativeDate(snippet.createdAt);
  
  return (
    <motion.div variants={staggeredItem as any}>
      <Link href={`/snippets/${snippet._id}`} onClick={onClick}>
        <Card 
          magic
          hover 
          glow
          className={cn(
            "h-full group overflow-hidden",
            className
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all duration-200 group-hover:bg-primary/20 group-hover:scale-105">
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
            <div className="h-[120px] overflow-hidden rounded-lg bg-muted p-3 transition-all duration-300 group-hover:bg-muted/80 group-hover:shadow-inner">
              <pre className="text-xs leading-relaxed cascadia-code-regular">
                <code className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {codePreview}
                </code>
              </pre>
            </div>
          </CardContent>
          
          <CardFooter className="flex items-center justify-between pt-0 text-xs text-muted-foreground">
            <div className="flex items-center">
              <span>By {userName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              <span>{relativeDate}</span>
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