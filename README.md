# Personal Portfolio Website

## About Developer
**Name**: Tesfay Mulaw  
**Email**: tesfaymulaw42@gmail.com  
**Phone**: 0975127730

## Introduction
This is a dynamic, modern full-stack personal portfolio website designed to showcase my professional profile, projects, and technical skills in an interactive and visually engaging way. The platform is built using React, Vite, TypeScript, and Tailwind CSS, with a strong focus on performance, responsiveness, and clean user interface design. It features a dynamic content management system that enables seamless updates without modifying the core codebase. This portfolio serves as both a representation of my technical expertise and my personal brand.

## Features
1. **User-Friendly Interface** – Intuitive and easy-to-navigate design for a smooth user experience.
2. **Responsive UI/UX Design** – Fully optimized for mobile, tablet, and desktop devices.  
3. **Full-Stack Integration** – Seamless connection between frontend and backend services.  
4. **Dual (Admin & Public) User Roles** – Supports both admin and public users with different access levels.  
5. **User Authentication System** – Secure login and access control for admin functionalities.  
6. **Real-Time Data Handling** – Dynamic data updates and synchronization using Supabase.  
7. **Dynamic Content Management** – Easily manage and update content without changing the core codebase.  
8. **Project Showcase Section** – Display projects with descriptions, technologies, and links.  
9. **Blogs & Articles Section** – Share knowledge, insights, and updates through dynamic posts.  
10. **Contact detail Section** – Enables visitors to connect easily through provided contact details.

## Tech Stack
### Frontend
**React** – Component-based UI library for building interactive interfaces  
**Vite** – Fast development build tool for modern web projects  
**TypeScript** – Strongly typed JavaScript for better scalability and maintainabilit  
**Tailwind CSS** – Utility-first CSS framework for responsive and modern design
### Backend
**Supabase** – Backend-as-a-Service providing:  
- PostgreSQL Database  
- Authentication System  
- Real-time APIs
### Deployment
**Vercel** – Cloud platform for fast and scalable frontend deployment
## How to Use

- **Home** – Overview of my profile  
- **Projects** – Showcase of my work  
- **Blogs** – Articles and insights  
- **Resume** – View/download my CV  
- **Contact** – Get in touch  

## Project structure

```
portfolio-Public/
│
├── public/              # Static assets (images, icons, etc.)
│
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Application pages (Home, Projects, Blog, etc.)
│   │   └── public/      # Public-facing pages
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API calls and Supabase configuration
│   ├── utils/           # Helper and utility functions
│   ├── types/           # TypeScript types and interfaces
│   ├── lib/             # Shared libraries and configurations
│   ├── main.tsx         # Application entry point
│   ├── App.tsx          # Root React component
│   ├── globals.css      # Global styles
│   ├── index.css        # Base styles (Tailwind / resets)
│   └── vite-env.d.ts    # Vite environment type definitions
│
├── package.json        # Project metadata and dependencies
├── package-lock.json   # NPM dependency lock file
├── bun.lock            # Bun dependency lock file
├── components.json     # UI components configuration (e.g., shadcn)
├── index.html          # Main HTML template
├── postcss.config.js   # PostCSS configuration (used by Tailwind)
├── eslint.config.js    # ESLint configuration
│
├── tsconfig.json       # Base TypeScript configuration
├── tsconfig.app.json   # TypeScript config for app source
├── tsconfig.node.json  # TypeScript config for Node tools
│
└── vite.config.ts      # Vite build and dev server configuration
```

### Installation & Setup

Follow these steps to run the project locally on your machine:

### 1. Prerequisites

Make sure you have installed:
- Node.js (v16 or later)
- npm package manager
- Supabase account


### 2. Clone the Repository

```bash
git clone https://github.com/Tesfaymulaw/Portfolio.git
cd Portfolio
````

### 3. Install Dependencies

```bash
npm install
```
### 4. Environmental Variables Setup

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

### 7. Preview Production Build

```bash
npm run preview
```
