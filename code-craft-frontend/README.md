# Code-Craft Frontend

A modern, responsive code editor frontend built with Next.js 14, shadcn/ui, and Monaco Editor. This project provides a comprehensive web-based IDE experience with code execution, snippet sharing, and collaboration features.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **API Integration**: Axios + React Query
- **Code Editor**: Monaco Editor
- **Animations**: Framer Motion + ReactBits
- **Form Handling**: React Hook Form + Zod
- **TypeScript**: For type safety and better developer experience

## Features

- **Modern Code Editor**: Full-featured Monaco Editor with syntax highlighting for 10+ languages
- **Code Execution**: Execute code in 10+ programming languages
- **Snippet Management**: Save, share, and organize code snippets
- **Collaboration**: Comment on snippets and star your favorites
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Mode**: Fully themeable interface with system preference detection
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/code-craft.git
cd code-craft/code-craft-frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file based on `.env.local.example`
```bash
cp .env.local.example .env.local
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Design System

### Color System

The color system is built on WCAG 2.1 AA contrast requirements, ensuring accessibility while providing a cohesive visual identity. It uses CSS variables for theming and supports both light and dark modes.

### Typography

The typography system uses a modular scale with a base size of 16px and a Major Third (1.250) ratio. It's responsive, with different scales for mobile and desktop viewports.

### Spacing

A consistent 4px grid system is used for all spacing, margins, and paddings to create visual rhythm throughout the application.

### Animation

Animations are categorized into two priorities:
- P1 (Functional): Essential feedback for user interactions
- P2 (Aesthetic): Subtle enhancements for the overall feel

All animations respect the user's motion preferences (prefers-reduced-motion).

## API Integration

The frontend integrates with the Code-Craft backend API, which provides:
- Authentication (JWT)
- Code execution for 10+ languages
- Snippet CRUD operations
- Comments and stars
- User profiles

## Responsive Design Strategy

The application uses three primary breakpoints:
- Mobile: 320px-767px
- Tablet: 768px-1279px
- Desktop: 1280px+

Each view is optimized for its form factor:
- Desktop: Multi-panel layout with resizable sections
- Tablet: Adaptive layout with bottom sheet for secondary panels
- Mobile: Full-screen editor with bottom navigation and optimized touch controls

## Folder Structure

```
src/
├── app/                # Next.js App Router pages
├── components/         # UI components
│   ├── ui/             # Base shadcn/ui components
│   ├── layout/         # Layout components
│   ├── editor/         # Editor-specific components
│   └── snippet/        # Snippet-related components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── stores/             # Zustand state stores
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the component system
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editing experience
- [ReactBits](https://reactbits.io/) for animation inspiration 