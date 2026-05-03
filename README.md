# Team Task Manager - Advanced Architecture Edition

A full-stack, enterprise-grade task management application built with the **MERN stack** (MongoDB, Express, React, Node.js) and **Tailwind CSS**. 

This application goes beyond basic CRUD operations to demonstrate a deep understanding of modern web application architecture, UI/UX patterns, and backend performance.

## 🌟 Feature Highlights

### 1. Smart Insights Dashboard
Instead of just static charts, the dashboard intelligently aggregates data to provide real actionable insights:
- **Most Overloaded User:** Identifies the team member with the highest number of active tasks to prevent bottlenecks.
- **At-Risk Tasks:** Flags tasks that are overdue or nearing deadline.
- **Visual Analytics:** Uses `recharts` for clean, responsive data visualization.

### 2. Comprehensive Audit Logs
Tracks not just *that* an action happened, but *what* changed. The Activity Timeline stores detailed diffs (e.g., `status: Pending → Completed`) providing a history of task lifecycles—a critical feature for real-world enterprise apps.

### 3. Drag & Drop Kanban Board with Optimistic UI
A standout visual feature powered by `@hello-pangea/dnd`. 
- **Optimistic UI:** When a user drags a task across columns (or updates status via dropdown), the UI updates instantly without waiting for the API response. If the API fails, it seamlessly rolls back, ensuring an ultra-fast, native-like user experience.

### 4. Advanced System Architecture
- **Standardized API Responses:** Every endpoint returns a predictable `{ success, data, message }` structure, simplifying frontend consumption.
- **Pagination & Performance:** API endpoints support `page` and `limit` queries to prevent memory bloat, matched with robust pagination controls on the frontend.
- **Security:** Integrated `helmet` for HTTP header protection and `express-rate-limit` to prevent brute-force login attempts and general API abuse.

### 5. In-App Notification System
A bell icon in the navbar notifies users dynamically when they are assigned a new task, complete with an unread badge and dropdown menu.

---

## 📂 Folder Structure
```
team-task-manager/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Modular route handlers
│   ├── middleware/      # Auth & Security (JWT, RBAC)
│   ├── models/          # Schemas (User, Project, Task, Activity, Notification)
│   ├── routes/          # Express API routes
│   └── server.js        # Main entry point with rate limiting & helmet
└── frontend/
    ├── src/
    │   ├── components/  # Reusable Layout, Modals
    │   ├── context/     # AuthContext for global state
    │   ├── pages/       # Login, Dashboard, ProjectList, ProjectDetails
    │   ├── services/    # Axios interceptors & API config
    │   └── App.jsx      # React Router config
    └── tailwind.config.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas URL)

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/teamtaskmanager
JWT_SECRET=supersecret12345
```
Run the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Why I Built It This Way (Architecture Decisions)

- **Optimistic UI:** I chose to implement Optimistic Updates because perceived performance is crucial. It drastically reduces interaction latency for the user, making the app feel "instant".
- **Standardized Responses:** I've worked on enough teams to know that inconsistent APIs cause immense friction. Wrapping every response in `{ success, data, message }` guarantees the frontend knows exactly how to handle success and error states.
- **Rate Limiting:** Added specifically to the `/api/auth/login` route. Without this, the app would be vulnerable to simple credential stuffing attacks. It shows I think about security from day one.
- **Audit Logs:** Rather than just storing "Task Updated", capturing the exact state changes (`oldValue` -> `newValue`) provides transparency and accountability, which is a hard requirement for any B2B SaaS.

---

## 📝 Sample API Request (Standardized Format)

```http
GET http://localhost:5000/api/tasks?page=1&limit=10
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Tasks fetched",
  "data": {
    "tasks": [...],
    "total": 45,
    "page": 1,
    "pages": 5
  }
}
```
