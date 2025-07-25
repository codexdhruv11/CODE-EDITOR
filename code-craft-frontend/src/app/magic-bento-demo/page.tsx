'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MagicBentoCard, 
  MagicBentoGrid, 
  MagicBentoButton, 
  MagicBentoContainer,
  MAGIC_BENTO_CONFIG 
} from '@/components/ui/magic-bento';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, Zap, Sparkles, Code, Palette } from 'lucide-react';

export default function MagicBentoDemoPage() {
  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <MagicBentoContainer fadeIn slideDirection="up" className="text-center">
        <motion.h1 
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Magic Bento Animations
        </motion.h1>
        <motion.p 
          className="text-lg text-muted-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Experience smooth, delightful animations with spring-based easing and responsive design
        </motion.p>
      </MagicBentoContainer>

      {/* Basic Cards Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Basic Magic Cards</h2>
        <MagicBentoGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} stagger="normal">
          <MagicBentoCard hover glow>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <CardTitle>Smooth Animations</CardTitle>
              </div>
              <CardDescription>
                Cards with gentle scale transforms and shadow elevation effects
              </CardDescription>
            </CardHeader>
          </MagicBentoCard>

          <MagicBentoCard hover delay={0.1}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <CardTitle>Spring Physics</CardTitle>
              </div>
              <CardDescription>
                Natural movement with spring-based easing for organic feel
              </CardDescription>
            </CardHeader>
          </MagicBentoCard>

          <MagicBentoCard hover glow delay={0.2}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <CardTitle>Responsive Design</CardTitle>
              </div>
              <CardDescription>
                Grid layouts that adapt beautifully across all device sizes
              </CardDescription>
            </CardHeader>
          </MagicBentoCard>
        </MagicBentoGrid>
      </section>

      {/* Interactive Buttons */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Magic Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <MagicBentoButton glow>
            <Sparkles className="h-4 w-4 mr-2" />
            Glowing Button
          </MagicBentoButton>
          
          <MagicBentoButton variant="secondary">
            <Code className="h-4 w-4 mr-2" />
            Secondary Style
          </MagicBentoButton>
          
          <MagicBentoButton variant="outline" size="lg">
            <Palette className="h-4 w-4 mr-2" />
            Large Outline
          </MagicBentoButton>
          
          <Button magic glow variant="ghost">
            Enhanced Button
          </Button>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Feature Showcase</h2>
        <MagicBentoGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }} stagger="slow">
          <Card magic hover glow className="magic-float-animation">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Staggered Delays</CardTitle>
              <CardDescription>
                Items animate in sequence with customizable timing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card magic hover glow delay={0.1} className="magic-pulse-animation">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Hover Effects</CardTitle>
              <CardDescription>
                Smooth scale and elevation changes on interaction
              </CardDescription>
            </CardHeader>
          </Card>

          <Card magic hover glow delay={0.2}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Performance</CardTitle>
              <CardDescription>
                Optimized animations that respect user preferences
              </CardDescription>
            </CardHeader>
          </Card>

          <Card magic hover glow delay={0.3}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>
                Respects prefers-reduced-motion for inclusive design
              </CardDescription>
            </CardHeader>
          </Card>
        </MagicBentoGrid>
      </section>

      {/* Configuration Display */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Animation Configuration</h2>
        <Card magic hover className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Durations</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Micro: {MAGIC_BENTO_CONFIG.duration.micro}ms</li>
                <li>Short: {MAGIC_BENTO_CONFIG.duration.short}ms</li>
                <li>Medium: {MAGIC_BENTO_CONFIG.duration.medium}ms</li>
                <li>Long: {MAGIC_BENTO_CONFIG.duration.long}ms</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Scale Values</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Hover: {MAGIC_BENTO_CONFIG.scale.hover}x</li>
                <li>Active: {MAGIC_BENTO_CONFIG.scale.active}x</li>
                <li>Focus: {MAGIC_BENTO_CONFIG.scale.focus}x</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Stagger Delays</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Fast: {MAGIC_BENTO_CONFIG.stagger.fast}s</li>
                <li>Normal: {MAGIC_BENTO_CONFIG.stagger.normal}s</li>
                <li>Slow: {MAGIC_BENTO_CONFIG.stagger.slow}s</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Spring Physics</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Gentle: 300/30</li>
                <li>Bouncy: 400/25</li>
                <li>Smooth: 200/40</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* Call to Action */}
      <MagicBentoContainer fadeIn slideDirection="up" className="text-center">
        <Card magic hover glow className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Implement Magic Bento animations in your components today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagicBentoButton size="lg" glow>
                <Code className="h-4 w-4 mr-2" />
                View Documentation
              </MagicBentoButton>
              <MagicBentoButton variant="outline" size="lg">
                <Star className="h-4 w-4 mr-2" />
                See Examples
              </MagicBentoButton>
            </div>
          </CardContent>
        </Card>
      </MagicBentoContainer>
    </div>
  );
}