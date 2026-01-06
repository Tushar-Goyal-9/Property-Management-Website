# 🏠 Property Dunia – MERN Stack Property Management System

Property Dunia is a full-stack property management web application built using the MERN stack.  
The platform allows users to browse properties while admins can securely add and manage property listings.

---

## 📌 Project Overview

The main goal of this project is to create a real-world real estate platform where:

- Users can view luxury properties
- Admins can add new properties
- Each property has images, details, and contact information
- Authentication and authorization are handled securely

---

## 🛠️ Tech Stack Used

### Frontend
- React.js – Component-based UI development
- React Router DOM – Client-side routing
- Tailwind CSS – Utility-first styling
- Axios – API communication

### Backend
- Node.js – JavaScript runtime
- Express.js – REST API framework
- MongoDB – NoSQL database
- Mongoose – MongoDB object modeling

### Authentication & Security
- JWT (JSON Web Tokens)
- Role-based access control (Admin / User)
- Protected routes (Frontend + Backend)

---

## 📂 Project Structure

```text
property-dunia/
│
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & role middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── routes/      # Protected & admin routes
│   │   ├── services/    # API services
│   │   └── utils/       # Helper functions
│   └── main.jsx
│
├── .gitignore
└── README.md
```

---


---

## ✨ **Key Features**

### **User Features**
- View property listings
- Property details page
- Image slider for multiple images
- Contact details shown

### **Admin Features**  
- Secure login
- Add property
- Protected admin routes

### **UI/UX**
- Premium minimal design
- Hero section with featured properties
- Responsive layout
- Clean card-based listings

---

## 🔐 **Authentication Flow**
1. User/Admin logs in
2. Backend verifies credentials
3. JWT token generated
4. Token stored in browser localStorage
5. Protected routes validate token & role

---

## 🌐 **API Endpoints**

| Method | Endpoint              | Description            |
|--------|----------------------|------------------------|
| POST   | `/api/auth/login`    | Login user            |
| POST   | `/api/properties`    | Add property (Admin)  |
| GET    | `/api/properties`    | Get all properties    |
| GET    | `/api/properties/:id`| Get property details  |

---

## 🚀 **How to Run Locally**
### **Clone the Repository**
```bash
git clone https://github.com/Tushar-Goyal-9/Property-Management-Website.git
cd property-dunia
```

### **Backend**
```bash
cd backend
npm install
npm start
```
#### **Create .env in backend/:**
```bash
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
```
### **Frontend**
```bash
cd frontend
npm install
npm run dev
```
## ✨  Learning Outcomes

Through this project, I learned:
- MERN stack architecture
- REST API development
- JWT authentication
- Role-based authorization
- React component design
- State management with hooks
- Clean UI using Tailwind CSS
- Git & GitHub workflow


## 👨‍💻 Developer
Tushar Goyal

## ⭐ Future Enhancements
- Property filtering (price, city, type)
- Image upload using Cloudinary
- Admin dashboard
- Property edit & delete





