'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MagicBentoGrid } from '@/components/ui/magic-bento';

export function FontDemo() {
  const codeExample = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`;

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Font Implementation Demo</h1>
        <p className="text-muted-foreground">
          Showcasing Cascadia Code and Geist Mono fonts across the application
        </p>
      </div>

      <MagicBentoGrid columns={{ mobile: 1, tablet: 2, desktop: 2 }}>
        {/* Cascadia Code Demo */}
        <Card magic hover>
          <CardHeader>
            <CardTitle className="cascadia-code-semibold">Cascadia Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Weight Variations:</h4>
              <div className="space-y-2">
                <p className="cascadia-code-light">Light (300) - Quick brown fox</p>
                <p className="cascadia-code-regular">Regular (400) - Quick brown fox</p>
                <p className="cascadia-code-medium">Medium (500) - Quick brown fox</p>
                <p className="cascadia-code-semibold">Semibold (600) - Quick brown fox</p>
                <p className="cascadia-code-bold">Bold (700) - Quick brown fox</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Code Example:</h4>
              <pre className="cascadia-code-regular bg-muted p-3 rounded text-sm overflow-x-auto">
                <code>{codeExample}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Geist Mono Demo */}
        <Card magic hover>
          <CardHeader>
            <CardTitle className="geist-mono-semibold">Geist Mono</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Weight Variations:</h4>
              <div className="space-y-2">
                <p className="geist-mono-thin">Thin (100) - Quick brown fox</p>
                <p className="geist-mono-light">Light (300) - Quick brown fox</p>
                <p className="geist-mono-regular">Regular (400) - Quick brown fox</p>
                <p className="geist-mono-medium">Medium (500) - Quick brown fox</p>
                <p className="geist-mono-semibold">Semibold (600) - Quick brown fox</p>
                <p className="geist-mono-bold">Bold (700) - Quick brown fox</p>
                <p className="geist-mono-extrabold">Extra Bold (800) - Quick brown fox</p>
                <p className="geist-mono-black">Black (900) - Quick brown fox</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Terminal Example:</h4>
              <pre className="geist-mono-regular bg-black text-green-400 p-3 rounded text-sm overflow-x-auto">
                <code>{`$ npm install
$ npm run dev
$ git commit -m "Add new fonts"
$ docker build -t app .`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card magic hover>
          <CardHeader>
            <CardTitle>Usage in Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Tailwind Classes:</h4>
              <div className="space-y-2 text-sm">
                <code className="bg-muted px-2 py-1 rounded">font-cascadia</code> - Cascadia Code
                <br />
                <code className="bg-muted px-2 py-1 rounded">font-geist</code> - Geist Mono
                <br />
                <code className="bg-muted px-2 py-1 rounded">font-code</code> - Code font stack
                <br />
                <code className="bg-muted px-2 py-1 rounded">font-mono</code> - Mono font stack
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">CSS Classes:</h4>
              <div className="space-y-1 text-sm">
                <code className="bg-muted px-2 py-1 rounded block">.cascadia-code-regular</code>
                <code className="bg-muted px-2 py-1 rounded block">.geist-mono-medium</code>
                <code className="bg-muted px-2 py-1 rounded block">.cascadia-code-bold</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Status */}
        <Card magic hover>
          <CardHeader>
            <CardTitle>Implementation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm">Google Fonts integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm">Tailwind font families</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm">CSS utility classes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm">Monaco Editor integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm">Code block styling</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </MagicBentoGrid>
    </div>
  );
}