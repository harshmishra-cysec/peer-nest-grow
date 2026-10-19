# SkillNest

> Smart Collaborative Learning Circles with Balanced Peer Groups

SkillNest is a peer-learning platform built with React, TypeScript, TanStack Start, and Tailwind CSS. It enables learners to join or create topic-based Learning Circles (e.g. Data Structures & Algorithms, UI/UX Design, Full-Stack Web Development) with defined goals, commitment levels, and timelines. When a circle reaches 9 members, the system balances them into 3-person sub-groups featuring a mix of Beginner, Intermediate, and Advanced learners with collaborative workspaces, task confirmation, shared checklists, and real-time group chat.

---

## Tech Stack

- **Framework & Routing**: React 19, [TanStack Start](https://tanstack.com/start) with file-based routing and Server-Side Rendering (SSR)
- **Language**: TypeScript (strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with `@tailwindcss/vite`
- **State & Data Fetching**: TanStack React Query v5
- **UI Components**: Radix UI Primitives, Lucide React icons, Sonner toast notifications, Recharts
- **Build Tool**: Vite 8 & Nitro

---

## Project Structure

```text
├── public/                 # Static assets (favicons, robots.txt)
├── src/
│   ├── components/         # Reusable React components
│   │   ├── brand/          # Logo and identity
│   │   ├── forms/          # Form fields, selection controls
│   │   ├── layout/         # AppShell, PageHeader
│   │   ├── shared/         # MemberAvatar, Badges, StatCards
│   │   ├── ui/             # Radix-backed UI primitive library
│   │   └── workspace/      # Sub-group workspace, chat panel, task dialogs
│   ├── constants/          # Static routes, topics, levels, options
│   ├── hooks/              # Custom React hooks (async data, responsive)
│   ├── lib/                # Utility helpers, string formatters, error handling
│   ├── routes/             # File-based TanStack Start routes
│   │   ├── __root.tsx      # Root application layout, shell & provider context
│   │   ├── index.tsx       # Landing page
│   │   ├── auth.tsx        # Authentication page
│   │   ├── start.tsx       # Choice screen: Join or Make a Circle
│   │   ├── circles/        # Circle discovery, creation, recommendations, workspace
│   │   └── profile.tsx     # Learner profile, streaks & badges
│   ├── services/           # Service layer for Circles, Sub-groups, Chat, Users
│   ├── types/              # Central TypeScript definitions (Circle, Task, Message, User)
│   ├── router.tsx          # Client router factory
│   ├── server.ts           # Server entry point
│   ├── start.ts            # TanStack Start instance configuration
│   └── styles.css          # Tailwind CSS design system rules and CSS variables
├── eslint.config.js        # ESLint flat configuration
├── package.json            # Project dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build and plugin configuration
```

---

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd skillnest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

Compile and bundle the application for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Code Quality

- **Lint code**: `npm run lint`
- **Format code**: `npm run format`

---

## License

This project is licensed under the MIT License.
