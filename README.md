# 🍽️⚡ DineFlow — Next-Gen AI-Powered Restaurant Operations & Intelligent Dining System

> **Vibeathon 6.0 Hackathon Project**  
> **Team Name:** `kafeelraza55`  
> **Team Leader:** Kafeel Raza  
> **Live Demo URL:** [https://dineflow-restaurant-system.vercel.app](https://dineflow-restaurant-system.vercel.app)  
> **GitHub Repository:** [https://github.com/kafeelraza/dineflow-restaurant-system](https://github.com/kafeelraza/dineflow-restaurant-system)

---

## 🌟 Executive Summary

**DineFlow** is an enterprise-grade, real-time web operating system designed to transform modern restaurant operations. It unifies dining room table reservations, kitchen Kanban workflows, waiter order claiming, inventory management, and executive analytics into a seamless, role-isolated platform powered by **Google Gemini 2.0 Flash AI**.

---

## 🚀 Key Features & Hackathon Tier Breakdown

### 🥉 Bronze Tier: Editorial UI/UX & Responsive Design System
* **Editorial Aesthetics:** Built with curated CSS tokens (`--terracotta`, `--cream`, `--ink`, `--sage`), smooth glassmorphism, and Playfair Display typography.
* **Responsive Layouts:** Mobile drawer navigation, sticky top bars, and touch-optimized controls across all devices.

### 🥈 Silver Tier: Auth, QR Menu & Floor Plan Reservations
* **Multi-Method Supabase Authentication:** Email/Password, 6-digit Magic Link OTP, and Google OAuth with dynamic redirect routing.
* **Interactive 16-Table Floor Plan:** Real-time visual table status toggling (`Available`, `Occupied`, `Reserved`, `Cleaning`) with server assignment.
* **Digital QR Menu & Dynamic Receipts:** Takeaway & Dine-in ordering, item customization, and itemized billing receipts.

### 🥇 Gold Tier: Operational Command & Role Isolation
* **Realtime 5-Stage Kitchen Kanban:** Live order tracking (`Placed` → `Confirmed` → `Preparing` → `Ready` → `Served`) powered by Supabase WebSocket subscriptions.
* **3-Mode Filter Toggle Bar:** Instant queue filtering for `All Orders`, `Dine-In`, and `Takeaway`.
* **Waiter Order Claiming Workflow:** Waiters can claim unassigned orders with 1-click (`[ 👤 Claim this order ]`).
* **Role-Isolated Notification Center:** Top-right floating toast notifications for new orders and payments, with per-user notification clearing.
* **Inventory Watch:** Automated low-stock warning thresholds with 1-tap supplier restock dispatches.

### 💎 Platinum Tier: Google Gemini 2.0 Flash AI Innovations
* **⏱️ Real-Time Kitchen Wait-Time Predictor (`/api/ai/wait-time`):** Calculates estimated prep times based on active kitchen load and chef counts with live AI advice.
* **💬 Customer-Facing Dining Assistant (`/api/ai/chat`):** Context-aware AI chatbot suggesting personalized dishes based on customer dietary preferences and live menu availability.
* **📊 Executive Shift Briefing Generator (`/api/ai/daily-digest`):** Synthesizes daily revenue, drink pairings, and inventory restock priorities into an executive summary.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| **Styling System** | Vanilla CSS Tokens & Tailwind Utility Classes |
| **Database & Realtime** | Supabase PostgreSQL + WebSocket Realtime Subscriptions (`postgres_changes`) |
| **Authentication & RLS** | Supabase Auth with Row Level Security (RLS) policies for `Admin`, `Staff`, and `Customer` |
| **AI Integration** | Google Gemini 2.0 Flash REST API (Direct Fetch Integration) |
| **Hosting & CI/CD** | Vercel Continuous Deployment |

---

## ⚡ Quick Start & Local Setup

### Prerequisites
* Node.js 18.x or higher
* npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/kafeelraza/dineflow-restaurant-system.git
cd dineflow-restaurant-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Role Credentials & Evaluation Guide

For hackathon judges and evaluators, test the application across different user roles:

1. **Guest / Customer Experience (`/menu`):**
   * Browse live digital menu, add items to cart, ask the Gemini AI dining assistant for dish recommendations, and place a Dine-In or Takeaway order.
2. **Staff / Waiter Experience (`/dashboard/orders`):**
   * View live incoming orders, filter by `Dine-In` or `Takeaway`, click `Claim this order`, and update kitchen order status.
3. **Admin / Owner Experience (`/dashboard`):**
   * View sales analytics, manage table floor plans, monitor low-stock inventory, and generate Gemini AI Daily Executive Briefings.

---

## 📜 License
Developed for **Vibeathon 6.0 Hackathon (July 2026)** by Team `kafeelraza55`. All rights reserved.
