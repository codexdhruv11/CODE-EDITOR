import axios from 'axios';
import { SUPPORTED_LANGUAGES, API_CONSTANTS, getLanguageById } from '../utils/constants';
import { logger } from '../utils/logger';

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  language: string;
  code: string;
}

export interface PistonResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

class CodeExecutionService {
  private readonly pistonApiUrl = API_CONSTANTS.PISTON_API_URL;
  private readonly timeout = API_CONSTANTS.EXECUTION_TIMEOUT;

  /**
   * Execute code using Piston API
   * CRITICAL: All languages are available to all authenticated users (no premium restrictions)
   */
  async executeCode(language: string, code: string): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Validate language
      const languageConfig = getLanguageById(language);
      if (!languageConfig) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // Prepare request payload for Piston API
      const payload = {
        language: languageConfig.pistonRuntime.language,
        version: languageConfig.pistonRuntime.version,
        files: [
          {
            name: this.getFileName(language),
            content: code,
          },
        ],
        stdin: '',
        args: [],
        compile_timeout: 10000, // 10 seconds
        run_timeout: 3000, // 3 seconds
      };

      logger.info(`Executing ${language} code via Piston API`, {
        language: languageConfig.pistonRuntime.language,
        version: languageConfig.pistonRuntime.version,
        codeLength: code.length,
      });

      // Make request to Piston API
      const response = await axios.post<PistonResponse>(this.pistonApiUrl, payload, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const executionTime = Date.now() - startTime;
      const pistonResult = response.data;

      // Process the response
      const result = this.processExecutionResult(pistonResult, language, code, executionTime);

      logger.info(`Code execution completed`, {
        language,
        success: result.success,
        executionTime: result.executionTime,
        hasOutput: !!result.output,
        hasError: !!result.error,
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      logger.error('Code execution failed:', {
        language,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      });

      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            error: 'Execution timed out. Please try with simpler code.',
            executionTime,
            language,
            code,
          };
        }

        if (error.response?.status === 400) {
          return {
            success: false,
            error: 'Invalid code or language configuration.',
            executionTime,
            language,
            code,
          };
        }

        return {
          success: false,
          error: 'Code execution service is temporarily unavailable.',
          executionTime,
          language,
          code,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime,
        language,
        code,
      };
    }
  }

  /**
   * Process Piston API response into our standard format
   */
  private processExecutionResult(
    pistonResult: PistonResponse,
    language: string,
    code: string,
    executionTime: number
  ): ExecutionResult {
    const { run, compile } = pistonResult;

    // Check for compilation errors first
    if (compile && compile.code !== 0) {
      return {
        success: false,
        error: compile.stderr || compile.stdout || 'Compilation failed',
        executionTime,
        language,
        code,
      };
    }

    // Check for runtime errors
    if (run.code !== 0) {
      return {
        success: false,
        error: run.stderr || 'Runtime error occurred',
        output: run.stdout || undefined,
        executionTime,
        language,
        code,
      };
    }

    // Successful execution
    return {
      success: true,
      output: run.stdout || 'Code executed successfully (no output)',
      executionTime,
      language,
      code,
    };
  }

  /**
   * Get appropriate filename for the language
   */
  private getFileName(language: string): string {
    const fileExtensions: Record<string, string> = {
      javascript: 'main.js',
      typescript: 'main.ts',
      python: 'main.py',
      java: 'Main.java',
      go: 'main.go',
      rust: 'main.rs',
      cpp: 'main.cpp',
      csharp: 'main.cs',
      ruby: 'main.rb',
      swift: 'main.swift',
    };

    return fileExtensions[language] || 'main.txt';
  }

  /**
   * Get all supported languages
   * CRITICAL: All languages are available to all users (no premium restrictions)
   */
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES.map(lang => ({
      id: lang.id,
      label: lang.label,
      icon: lang.icon,
      monacoLanguage: lang.monacoLanguage,
    }));
  }

  /**
   * Validate if a language is supported
   */
  validateLanguage(language: string): boolean {
    return SUPPORTED_LANGUAGES.some(lang => lang.id === language);
  }

  /**
   * Get language configuration by ID
   */
  getLanguageConfig(language: string) {
    return getLanguageById(language);
  }
}

// Export singleton instance
export const codeExecutionService = new CodeExecutionService();