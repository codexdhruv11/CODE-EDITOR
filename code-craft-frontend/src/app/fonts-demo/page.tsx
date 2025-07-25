'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MagicBentoGrid, MagicBentoContainer } from '@/components/ui/magic-bento';

export default function FontsDemoPage() {
  const codeExample = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);`;

  const weights = [
    { name: 'Light', weight: '300', class: 'font-light' },
    { name: 'Regular', weight: '400', class: 'font-normal' },
    { name: 'Medium', weight: '500', class: 'font-medium' },
    { name: 'Semibold', weight: '600', class: 'font-semibold' },
    { name: 'Bold', weight: '700', class: 'font-bold' },
  ];

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <MagicBentoContainer fadeIn slideDirection="up" className="text-center">
        <h1 className="text-4xl font-bold mb-4">Font Showcase</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Cascadia Code & Geist Mono Implementation
        </p>
      </MagicBentoContainer>

      {/* Cascadia Code Showcase */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Cascadia Code</h2>
        <MagicBentoGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} stagger="normal">
          {weights.map((weight, index) => (
            <Card key={weight.name} magic hover delay={index * 0.1}>
              <CardHeader>
                <CardTitle className="cascadia-code-medium">
                  {weight.name} ({weight.weight})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className={`cascadia-code-${weight.name.toLowerCase()} text-sm bg-muted p-4 rounded-lg overflow-x-auto`}>
                  <code>{`// Cascadia Code ${weight.name}
const greeting = "Hello World!";
function sayHello() {
  console.log(greeting);
}`}</code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </MagicBentoGrid>
      </section>

      {/* Geist Mono Showcase */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Geist Mono</h2>
        <MagicBentoGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} stagger="normal">
          {[
            { name: 'Thin', weight: '100', class: 'geist-mono-thin' },
            { name: 'Light', weight: '300', class: 'geist-mono-light' },
            { name: 'Regular', weight: '400', class: 'geist-mono-regular' },
            { name: 'Medium', weight: '500', class: 'geist-mono-medium' },
            { name: 'Semibold', weight: '600', class: 'geist-mono-semibold' },
            { name: 'Bold', weight: '700', class: 'geist-mono-bold' },
          ].map((weight, index) => (
            <Card key={weight.name} magic hover delay={index * 0.1}>
              <CardHeader>
                <CardTitle className="geist-mono-medium">
                  {weight.name} ({weight.weight})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className={`${weight.class} text-sm bg-muted p-4 rounded-lg overflow-x-auto`}>
                  <code>{`// Geist Mono ${weight.name}
const data = [1, 2, 3, 4, 5];
const doubled = data.map(x => x * 2);
console.log(doubled);`}</code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </MagicBentoGrid>
      </section>

      {/* Code Comparison */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Font Comparison</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card magic hover>
            <CardHeader>
              <CardTitle className="cascadia-code-semibold">Cascadia Code</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="cascadia-code-regular text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{codeExample}</code>
              </pre>
            </CardContent>
          </Card>

          <Card magic hover>
            <CardHeader>
              <CardTitle className="geist-mono-semibold">Geist Mono</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="geist-mono-regular text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{codeExample}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Typography Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Typography in Action</h2>
        <MagicBentoGrid columns={{ mobile: 1, tablet: 1, desktop: 1 }}>
          <Card magic hover glow>
            <CardHeader>
              <CardTitle>Real-world Usage Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Terminal Output */}
              <div>
                <h4 className="font-semibold mb-2">Terminal Output</h4>
                <div className="bg-black text-green-400 p-4 rounded-lg">
                  <pre className="geist-mono-regular text-sm">
{`$ npm run build
✓ Building application...
✓ Compiled successfully in 2.3s
✓ Ready on http://localhost:3000`}
                  </pre>
                </div>
              </div>

              {/* JSON Data */}
              <div>
                <h4 className="font-semibold mb-2">JSON Configuration</h4>
                <pre className="cascadia-code-regular text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{`{
  "name": "code-craft",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0"
  }
}`}</code>
                </pre>
              </div>

              {/* API Response */}
              <div>
                <h4 className="font-semibold mb-2">API Response</h4>
                <pre className="geist-mono-regular text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "data": {
    "user": "dhruv",
    "snippets": 42
  }
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </MagicBentoGrid>
      </section>
    </div>
  );
}