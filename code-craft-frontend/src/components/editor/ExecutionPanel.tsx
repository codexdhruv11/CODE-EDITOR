"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, AlertCircle, CheckCircle2, Clock, Save } from "lucide-react";
import { useMutation } from '@tanstack/react-query';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExecutionPanelProps } from "@/types/ui";
import { fadeIn } from "@/lib/animations";

export function ExecutionPanel({
  language,
  code,
  onExecute,
  isExecuting,
  result,
}: ExecutionPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { mutate: executeCode, isPending } = useMutation({
    mutationFn: async () => {
      // This would be replaced with actual API call
      // e.g. await axios.post('/api/executions', { code, language });
      
      // Simulate API call
      return new Promise<{ output: string; executionTime: number }>((resolve, reject) => {
        setTimeout(() => {
          // Simulate success or error
          if (code.includes('error') || Math.random() > 0.8) {
            resolve({
              output: 'Error: Something went wrong in your code.',
              executionTime: Math.random() * 0.5,
            });
            setExecutionStatus('error');
          } else {
            resolve({
              output: `Execution successful!\nOutput: ${code}`,
              executionTime: Math.random() * 1.5,
            });
            setExecutionStatus('success');
          }
        }, 1000);
      });
    },
    onSuccess: (data) => {
      setOutput(data.output);
      setExecutionTime(data.executionTime);
    },
    onError: (error) => {
      setOutput('Error: Failed to execute code. Please try again.');
      setExecutionStatus('error');
    },
  });

  const handleExecute = () => {
    if (!code.trim()) {
      setOutput('Error: Please enter some code to execute.');
      setExecutionStatus('error');
      return;
    }

    setExecutionStatus('idle');
    executeCode();
  };

  // Handle save as snippet
  const handleSaveSnippet = () => {
    setIsSaving(true);
    // Implement save logic or navigation to snippet creation form
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <motion.div
      className="flex h-full flex-col overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <Card className="flex h-full flex-col overflow-hidden border-0 shadow-none">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Execution Result</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="execute"
                size="sm"
                onClick={handleExecute}
                disabled={isPending || !code.trim()}
                isLoading={isPending}
                loadingText="Running"
              >
                {!isPending && <Play className="mr-1 h-4 w-4" />}
                Run
              </Button>
              
              {result && result.status === "success" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveSnippet}
                  disabled={isSaving}
                  isLoading={isSaving}
                  loadingText="Saving"
                >
                  {!isSaving && <Save className="mr-1 h-4 w-4" />}
                  Save as Snippet
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto p-0">
          {isPending ? (
            <Card className="p-4 flex items-center justify-center h-full" aria-busy="true">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Executing code...</p>
              </div>
            </Card>
          ) : output ? (
            <Card className="p-4 h-full flex flex-col">
              <div className="flex items-center mb-2">
                {executionStatus === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-success mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                )}
                <h3 className={cn(
                  "font-medium",
                  executionStatus === 'success' ? 'text-success' : 'text-destructive'
                )}>
                  {executionStatus === 'success' ? 'Success' : 'Error'}
                </h3>
                
                {executionTime !== null && (
                  <div className="ml-auto flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{executionTime.toFixed(2)}s</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 bg-muted p-3 rounded-md font-mono text-sm overflow-auto whitespace-pre-wrap">
                {output}
              </div>
            </Card>
          ) : (
            <Card className="p-4 flex items-center justify-center h-full border-dashed">
              <div className="text-center text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Run your code to see the output here</p>
              </div>
            </Card>
          )}
        </CardContent>
        
        <CardFooter className="border-t px-4 py-2">
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <span>Language: {language}</span>
            <span>Execution timeout: 30s</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 