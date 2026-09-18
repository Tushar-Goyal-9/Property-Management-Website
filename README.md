# 🏠 Property Dunia – MERN Stack Property Management System

Property Dunia is a full-stack real estate property management web application built using the MERN stack.  
It supports three user roles – **Admin**, **Property Agent**, and **Normal User** – with features like property listings, advanced search & filtering, wishlist management, property inquiries, direct WhatsApp communication, signed Cloudinary image uploads, transactional email notifications via Resend, and role-based administrative dashboards.

---

## 📌 Project Overview

The main goal of Property Dunia is to create a real-world real estate ecosystem where:

- **Users** can browse, search, and filter properties by city, price range, bedrooms, and listing type; save favorites to a wishlist; submit inquiries; and contact agents directly via WhatsApp.
- **Agents** can apply for agent verification, upload and manage their own property listings, upload multiple high-res images directly to Cloudinary, track view/inquiry stats, and handle buyer inquiries.
- **Admins** have full system control to manage users, approve/reject property listings, review agent verification applications, revoke agent privileges, and mark properties as "Featured" or "Hot".
- **Security & Performance** are maintained via JWT authentication, HTTP-only cookies, password hashing with bcrypt, rate limiting, and compound MongoDB indexing.

---

## 🛠️ Tech Stack Used

### Frontend
- **React.js (Vite)** – High-performance component-based UI
- **React Router DOM v6** – Client-side routing with protected routes
- **Tailwind CSS** – Custom utility-first styling & responsive layouts
- **Zustand** – Global auth state management
- **Axios** – Centralized API client with request/response interceptors
- **Framer Motion** – Smooth page transitions and modal animations
- **Lucide React** – Clean modern icons

### Backend
- **Node.js** – JavaScript backend runtime
- **Express.js** – RESTful API architecture
- **MongoDB Atlas** – Cloud NoSQL database
- **Mongoose** – Object Data Modeling (ODM) with custom indexes

### Authentication, Security & Utilities
- **JWT (JSON Web Tokens)** – Auth token stored in HTTP-only cookies & local storage
- **bcryptjs** – Secure password hashing
- **Helmet.js** – HTTP headers security
- **Express Rate Limit** – API rate limiting & DDoS protection
- **Cors** – Cross-Origin Resource Sharing with credentials support

### Third-Party Services
- **Cloudinary** – Direct client-side image uploads via server-signed signatures
- **Resend** – Transactional email delivery for password reset flows

---

## 📂 Project Structure

```text
property-dunia/
│
├── backend/
│   ├── config/              # MongoDB connection setup
│   ├── controllers/         # Business logic (auth, properties, inquiries, users, upload)
│   ├── middleware/          # Auth, upload, error, rate-limit, and validation middleware
│   ├── models/              # Mongoose schemas (User, Property, Inquiry)
│   ├── routes/              # Express API route declarations (auth, property, user, inquiry, upload)
│   ├── utils/               # Utilities (sendEmail via Resend)
│   ├── .env.example         # Template for environment variables
│   ├── server.js            # Express application entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/          # Static media assets
│   │   ├── components/      # Reusable UI (common, layout, property)
│   │   ├── pages/           # Application views (Home, Properties, PropertyDetails, Auth, Dashboards)
│   │   ├── routes/          # Route guards (ProtectedRoute, AdminRoute)
│   │   ├── store/           # Zustand store (authStore)
│   │   ├── services/        # Axios API client setup (api.js)
│   │   ├── utils/           # Helper formatters & WhatsApp utilities
│   │   ├── App.jsx          # Master component router & transitions
│   │   ├── main.jsx         # App mounting
│   │   └── index.css        # Tailwind CSS imports & global styles
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── package.json
```

---

## ✨ Key Features

### 👤 All Visitors & Users
- **Explore Listings**: Filter by city, min/max price, bedrooms, property type (Apartment, House, Villa, Office, Land, Condo), and listing type (Sale/Rent).
- **Compound Search Indexing**: Fast query responses using MongoDB indexed fields.
- **Property Details**: High-resolution image galleries, technical specs, address, owner/agent contact details, and view counters.
- **Direct WhatsApp Chat**: One-click pre-filled WhatsApp messaging with property owners/agents.

### 🔐 Registered Buyers & Renters
- **Secure Authentication**: Register/Login with JWT and persistent session checks.
- **Wishlist Management**: One-click save/remove favorite properties synced to the user profile in MongoDB.
- **Inquiry Submission**: Send inquiries directly to listing agents.
- **User Dashboard**: Track personal inquiries, wishlist items, and apply for Agent verification.
- **Password Reset Flow**: Request password reset via Resend email links with cryptographic reset tokens.

### 🏢 Property Agents
- **Agent Verification Workflow**: Submit agency details and license numbers for admin approval.
- **Agent Dashboard**: Real-time property and inquiry analytics (total views, total inquiries, active/sold/rented/archived status counts).
- **Listing Management**: Add, update, archive, or delete property listings.
- **Signed Cloudinary Uploads**: Secure direct multi-image uploads using signed server signatures.
- **Inquiry Inbox**: Review inquiries, filter by date/name, star important leads, and mark messages as read.

### 👑 Admin Management
- **Admin Dashboard**: System-wide overview metrics (users, agents, listings, views, pending applications).
- **User & Agent Control**: Approve/reject agent applications with custom feedback, revoke agent privileges, or delete users.
- **Property Moderation**: Approve/reject property listings, feature premium listings, or mark hot deals.

---

## 🔐 Authentication & Security Flow

```text
User Input (Login/Register) ➔ React State ➔ Axios POST /api/v1/auth/login
                                                  │
┌─────────────────────────────────────────────────┴─────────────────────────────────────────────────┐
│ Express Server                                                                                    │
│  1. Check User in MongoDB Atlas                                                                   │
│  2. Verify Password Hash via bcrypt.compare()                                                     │
│  3. Sign JWT Token (7-Day Expiry)                                                                 │
│  4. Attach Token to HTTP-Only Cookie (res.cookie) AND JSON Body                                   │
└─────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                  │
React App ➔ Store Token in LocalStorage & Zustand ➔ Axios Interceptor Attaches Authorization Header
```

---

## 🌐 API Endpoints Reference

### Auth Routes (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login user & issue JWT cookie/token |
| POST | `/logout` | Public | Clear auth cookie |
| GET | `/me` | Private | Get logged-in user profile |
| POST | `/forgot-password` | Public | Send password reset email via Resend |
| POST | `/reset-password/:token` | Public | Reset password using valid token |

### Property Routes (`/api/v1/properties`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get properties (filters, pagination, sort) |
| GET | `/:id` | Public | Get single property details (increments view count) |
| GET | `/admin` | Admin | Get all properties (including pending/private) |
| GET | `/admin/dashboard` | Admin | Get admin system-wide analytics |
| GET | `/dashboard/stats` | Agent/Admin | Get owner property & inquiry metrics |
| POST | `/` | Agent/Admin | Create new property listing |
| PUT | `/:id` | Owner/Admin | Update existing property listing |
| DELETE | `/:id` | Owner/Admin | Delete property listing |
| PATCH | `/:id/status` | Admin | Approve or reject property listing |
| PATCH | `/:id/feature` | Admin | Toggle featured property status |
| PATCH | `/:id/hot` | Admin | Toggle hot deal property status |

### User & Wishlist Routes (`/api/v1/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Admin | Get all registered users |
| GET | `/wishlist` | Private | Get current user's wishlist properties |
| POST | `/wishlist/:id` | Private | Add property to user's wishlist |
| DELETE | `/wishlist/:id` | Private | Remove property from user's wishlist |
| PATCH | `/agent-request` | User | Submit application for Agent verification |
| PATCH | `/agent-request/:id` | Admin | Approve or reject agent application |
| PATCH | `/:id/revoke-agent` | Admin | Revoke agent privileges back to normal user |
| DELETE | `/:id` | Admin | Delete a user account |

### Inquiry & Upload Routes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/inquiries` | Private | Submit inquiry for a property |
| GET | `/api/v1/inquiries` | Private | Get user or agent inquiries |
| PATCH | `/api/v1/inquiries/:id/read` | Agent/Admin | Mark inquiry as read |
| GET | `/api/v1/upload/signature` | Private | Generate signed Cloudinary upload params |

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Tushar-Goyal-9/Property-Management-Website.git
cd Property-Management-Website
```

### 2. Backend Setup
```bash
cd backend
npm install
```

#### **Create `.env` inside `backend/`:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Setup (Resend)
RESEND_API_KEY=your_resend_api_key
```

#### **Start Backend Server:**
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

#### **Create `.env` inside `frontend/`:**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_BACKEND_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
```

#### **Start Frontend Client:**
```bash
npm run dev
```

### 4. Access App
Open `http://localhost:5173` in your browser.

---

## 🎓 Key Engineering Insights & Learnings

- **Full MERN Stack Architecture**: Designed a decoupled frontend and backend using RESTful standards.
- **Client-Side Media Upload**: Offloaded binary file handling by generating signed Cloudinary signatures on Express and uploading directly from React via Axios.
- **Granular RBAC**: Implemented role-based access control supporting `user`, `agent`, and `admin` workflows.
- **Transactional Emails**: Integrated Resend SDK for cryptographic password reset emails.
- **Database Query Performance**: Created MongoDB compound indexes for optimized searching across multiple filter fields.

---

## 👨‍💻 Developer
[**Tushar Goyal**](https://github.com/Tushar-Goyal-9)

---

## ⭐ Future Enhancements

- [ ] Interactive map view using Leaflet / Mapbox
- [ ] Real-time Socket.io notifications for new inquiries & approvals
- [ ] Financial Mortgage & EMI Calculator
- [ ] Virtual 360 property tours (Matterport / Panorama embeds)
