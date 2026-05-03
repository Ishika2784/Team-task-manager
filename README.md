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

## 🚀 Installation

### Prerequisites:
- Node.js (v22.x or higher)
- MongoDB

### Steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/Ishika2784/Team-task-manager.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Team-task-manager
   ```
3. Install dependencies for both backend and frontend:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the `backend` directory with the following:
     ```env
     MONGO_URI=mongodb://<username>:<password>@<host>:<port>/<database>
     NODE_ENV=development
     PORT=3000
     ```
5. Build the frontend:
   ```bash
   npm run build
   ```
6. Start the application:
   ```bash
   cd ../backend
   node server.js
   ```

## 🌐 Deployment
The application is deployed on Railway. Ensure the `railway.json` file is correctly configured for monorepo builds.

## 🤝 Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: add your feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📧 Contact
For any inquiries, please contact Ishika2784 via GitHub.
