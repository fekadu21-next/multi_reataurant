# 🍽️ Addis Eats – Multi Restaurant Food Ordering System

## 📌 Project Overview

**Addis Eats** is a modern **multi-restaurant food ordering web application** designed to connect customers with multiple restaurants through a single platform. The system allows users to browse restaurants, explore menus, add food items to cart, place orders, and track their food ordering experience online.

The platform supports **three major user roles**:

- **Customer/User**
- **Restaurant Owner**
- **Administrator (Admin)**

Each role has its own dashboard and functionalities to ensure efficient management of restaurants, food orders, menus, and users.

This system is designed to improve the traditional food ordering process by providing a fast, secure, and convenient digital experience for restaurants and customers.

---

# 🚀 Problem Statement

Traditional food ordering methods often involve:

- Long waiting times
- Manual order handling
- Lack of centralized restaurant access
- Limited food discovery
- Poor order tracking
- Inefficient communication between restaurants and customers

Customers must visit restaurants physically or use phone calls to place orders, which can be time-consuming and inefficient.

This system solves these problems by creating a centralized digital platform where multiple restaurants can operate and customers can order food online conveniently.

---

# 🎯 Project Objectives

### General Objective

To develop a **full-stack multi-restaurant food ordering system** that enables customers to browse restaurants, place food orders, and allows restaurant owners to manage food menus and customer orders digitally.

### Specific Objectives

- Allow customers to browse multiple restaurants.
- Enable customers to search and explore food menus.
- Provide restaurant owners with restaurant management tools.
- Allow online order placement and order tracking.
- Implement recommendation systems for users.
- Manage categories, restaurants, and users through an admin panel.
- Create a responsive and modern user interface.
- Support secure authentication and authorization.

---

# 🏗️ System Architecture

The system follows a **Full-Stack MERN Architecture**:

## Frontend

Built using:

- React.js
- Tailwind CSS
- React Router DOM
- Context API
- Axios
- Framer Motion
- Lucide React / React Icons

Frontend Features:

- Responsive UI
- Dark/Light Mode
- Dynamic Routing
- Real-time Updates
- Interactive Dashboard

---

## Backend

Built using:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

Backend Responsibilities:

- API handling
- Authentication
- Restaurant management
- Order processing
- Recommendation system
- Real-time notifications

---

## Database

Database used:

**MongoDB**

Collections include:

- Users
- Restaurants
- Categories
- Menu Items
- Orders
- Reviews
- Cart Data

---

# 👥 User Roles and Features

## 1️⃣ Customer/User Features

Customers can:

✅ Register and Login  
✅ Browse Restaurants  
✅ View Restaurant Menus  
✅ Search Food Items  
✅ Add Items to Cart  
✅ Increase/Decrease Quantity  
✅ Place Orders  
✅ Checkout System  
✅ Receive Food Recommendations  
✅ Dark/Light Mode  
✅ Ask Questions About Food  
✅ View Order History

---

## 2️⃣ Restaurant Owner Features

Restaurant owners can:

✅ Login to Owner Dashboard  
✅ Manage Restaurant Information  
✅ Add Menu Items  
✅ Update Food Details  
✅ Delete Menu Items  
✅ View Customer Orders  
✅ Track New Orders  
✅ Manage Reviews  
✅ View Sales Analytics  
✅ Monitor Restaurant Performance  
✅ Dark/Light Theme Dashboard

---

## 3️⃣ Admin Features

Administrator can:

✅ Manage All Users  
✅ Manage Restaurants  
✅ Manage Categories  
✅ View All Orders  
✅ Monitor Platform Activity  
✅ Handle Risk Alerts  
✅ System Monitoring Dashboard  
✅ Real-Time Order Notifications

---

# 🌟 Key Features

## 🍔 Multi-Restaurant Support

Customers can order food from multiple restaurants in one platform.

---

## 🛒 Smart Cart System

Users can:

- Add to cart
- Increase quantity
- Decrease quantity
- Remove products

with automatic total price calculation.

---

## ⭐ Personalized Recommendation System

The system provides food recommendations:

- Based on user behavior
- Popular dishes
- Guest recommendations

---

## 🌙 Dark & Light Theme

The application supports:

- Light mode
- Dark mode

with theme persistence using local storage.

---

## 📦 Real-Time Order Notification

Using **Socket.IO**, restaurant owners and admins receive instant updates when new orders are placed.

---

## 📊 Sales Analytics Dashboard

Restaurant owners can analyze:

- Daily sales
- Weekly revenue
- Order statistics
- Popular menu items

through interactive charts.

---

## 🔐 Authentication & Security

The system implements:

- JWT Authentication
- Role-based authorization
- Protected routes
- Secure login system

---

# 🛠️ Technologies Used

## Frontend Technologies

| Technology | Purpose |
|------------|---------|
| React.js | UI Development |
| Tailwind CSS | Styling |
| React Router DOM | Navigation |
| Axios | API Communication |
| Context API | State Management |
| React Icons | Icons |
| Framer Motion | Animations |

---

## Backend Technologies

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Server Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Socket.IO | Real-Time Communication |
| Multer | File Upload |

---

# 📂 Project Structure

```plaintext
project-root/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── assets/
│   └── App.jsx
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
│
└── README.md
