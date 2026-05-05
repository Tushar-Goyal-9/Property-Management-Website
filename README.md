# 🏠 Property Dunia – MERN Stack Property Management System

Property Dunia is a full‑stack property management web application built using the MERN stack.  
It supports three user roles – **Admin**, **Property Agent**, and **Normal User** – with features like property listings, advanced search/filter, wishlist, inquiries, Cloudinary image uploads, and role‑based dashboards.

---

## 📌 Project Overview

The main goal of this project is to create a real‑world real estate platform where:

- Users can browse, search, and filter properties
- Users can save properties to a wishlist and contact agents
- Agents can add, edit, and manage their own property listings
- Admins can manage users and approve/reject property listings
- Each property includes multiple images, details, and inquiry functionality
- Authentication and authorization are handled securely with JWT

---

## 🛠️ Tech Stack Used

### Frontend
- React.js (Vite) – Component‑based UI development
- React Router DOM – Client‑side routing
- Tailwind CSS – Utility‑first styling
- Zustand – Lightweight global state management (auth)
- Axios – API communication with interceptors
- Framer Motion – Smooth page transitions
- Lucide React – Modern icon library

### Backend
- Node.js – JavaScript runtime
- Express.js – REST API framework
- MongoDB – NoSQL database (Atlas)
- Mongoose – MongoDB object modeling

### Authentication & Security
- JWT (JSON Web Tokens) stored in HTTP‑only cookies
- bcryptjs – Password hashing
- Role‑based access control (Admin / Agent / User)
- CORS configured for credentials

### Media
- Cloudinary – Secure image uploads with signed signatures

---

## 📂 Project Structure

```text
property-dunia/
│
├── backend/
│   ├── config/              # MongoDB connection
│   ├── controllers/         # Business logic (auth, properties, inquiries, users, upload)
│   ├── middleware/          # Auth, admin, error middleware
│   ├── models/              # User, Property, Inquiry schemas
│   ├── routes/              # API routes
│   ├── .env                 # Environment variables (not committed)
│   ├── .gitignore
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      # Reusable UI (common, layout, property, dashboard)
│   │   ├── pages/           # Application pages (Home, Properties, Details, Auth, Dashboards)
│   │   ├── routes/          # ProtectedRoute, AdminRoute
│   │   ├── store/           # Zustand auth store
│   │   ├── services/        # Axios API service
│   │   ├── hooks/           # Custom hooks (useAuth, useProperties)
│   │   ├── utils/           # Helper functions (formatPrice, formatDate)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind directives
│   ├── .env                 # VITE_API_URL, Cloudinary keys (not committed)
│   ├── .gitignore
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```




---

## ✨ Key Features

### All Users
- View property listings with image galleries
- Advanced search and filter (city, price, bedrooms, property type, sort)
- Property detail page with full information
- Responsive design (mobile‑first)

### Registered Users (Buyers/Renters)
- Secure login / registration
- Wishlist – save favorite properties
- Contact agents via inquiry form
- User dashboard with wishlist and inquiry history

### Property Agents
- Agent dashboard with stats (total listings, views, inquiries)
- Add, edit, and delete own property listings
- Upload multiple images directly to Cloudinary
- View and manage inquiries for own properties (mark as read)

### Admin
- Admin dashboard with overview stats
- Manage users (view all users)
- Approve or reject property listings submitted by agents
- Mark properties as "Featured"
- Delete any property

### UI/UX
- Clean, minimal, modern design
- Glass‑morphism hero section
- Smooth page transitions with Framer Motion
- Hover effects on property cards
- Professional icons with Lucide React

---

## 🔐 Authentication Flow

1. User/Agent/Admin registers or logs in
2. Backend verifies credentials and hashes password (bcrypt)
3. JWT token generated and set as HTTP‑only cookie
4. Frontend Zustand store fetches user data via `/auth/me`
5. Protected routes validate token and role
6. Logout clears the cookie

**Why HTTP‑only cookies?**
- Protects against XSS attacks (JavaScript cannot read the cookie)
- Automatically sent with every request

---

## 🌐 API Endpoints

| Method | Endpoint                              | Access            | Description                     |
|--------|---------------------------------------|-------------------|---------------------------------|
| POST   | `/api/v1/auth/register`               | Public            | Register user/agent             |
| POST   | `/api/v1/auth/login`                  | Public            | Login, sets JWT cookie          |
| POST   | `/api/v1/auth/logout`                 | Public            | Logout, clears cookie           |
| GET    | `/api/v1/auth/me`                     | Private           | Get current user                |
| GET    | `/api/v1/properties`                  | Public            | Get properties (filter/search)  |
| GET    | `/api/v1/properties/:id`              | Public            | Get single property             |
| POST   | `/api/v1/properties`                  | Agent/Admin       | Create new property             |
| PUT    | `/api/v1/properties/:id`              | Owner/Admin       | Update property                 |
| DELETE | `/api/v1/properties/:id`              | Owner/Admin       | Delete property                 |
| PATCH  | `/api/v1/properties/:id/status`       | Admin             | Approve/reject property         |
| PATCH  | `/api/v1/properties/:id/feature`      | Admin             | Toggle featured status          |
| GET    | `/api/v1/users/wishlist`              | Private           | Get user's wishlist             |
| POST   | `/api/v1/users/wishlist/:id`          | Private           | Add to wishlist                 |
| DELETE | `/api/v1/users/wishlist/:id`          | Private           | Remove from wishlist            |
| GET    | `/api/v1/users`                       | Admin             | Get all users                   |
| POST   | `/api/v1/inquiries`                   | Private           | Submit inquiry                  |
| GET    | `/api/v1/inquiries`                   | Private           | Get inquiries (user/agent)      |
| PATCH  | `/api/v1/inquiries/:id/read`          | Agent             | Mark inquiry as read            |
| GET    | `/api/v1/upload/signature`            | Private           | Get Cloudinary upload signature |

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Tushar-Goyal-9/Property-Management-Website.git
cd Property-Management-Website
```

### 2. Backend
```bash
cd backend
npm install
```
#### **Create .env in backend/:**
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
#### **Start the backend:**
```bash
npm run dev
# or
npx nodemon server.js
```
### 3. Frontend
```bash
cd ../frontend
npm install
```
#### **Create .env in frontend/:**
```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
```
#### **Start the frontend:**
```bash
npm run dev
```
### 4. Access the Application

## ✨  Learning Outcomes

Through this project, I learned:
- Full MERN stack architecture with separate frontend/backend
- RESTful API design and implementation
- JWT authentication with HTTP‑only cookies (secure)
- Role‑based access control (Admin, Agent, User)
- Advanced MongoDB queries (search, filter, pagination)
- Cloudinary direct uploads with server‑side signatures
- Responsive UI with Tailwind CSS
- Page transitions with Framer Motion
- Git & GitHub workflow


## 👨‍💻 Developer
[**Tushar Goyal**](https://github.com/Tushar-Goyal-9)

## ⭐ Future Enhancements

Planned improvements for the project:
- Map integration (Leaflet / Google Maps)
- Mortgage calculator
- Email notifications for inquiries and approvals
- Property analytics dashboard for agents
- Save search filters and alerts
- Virtual tour embed (YouTube / Matterport)
- Progressive Web App (PWA) support





