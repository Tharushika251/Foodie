
### Developer: Tharushika Rukshani

# 🍕 Foodie - Food Delivery Platform

A full-stack food delivery application built with microservices architecture, featuring real-time order tracking, multiple payment options, and a seamless user experience.

![Foodie Platform](https://img.shields.io/badge/Foodie-Delivery_Platform-green)
![Microservices](https://img.shields.io/badge/Architecture-Microservices-blue)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-orange)

## 🚀 Features

### 👥 User Features
- **User Authentication** - Secure login/registration with JWT
- **Restaurant Browsing** - Discover nearby restaurants with menus
- **Order Management** - Place, track, and manage food orders
- **Real-time Tracking** - Live delivery tracking with maps
- **Multiple Payments** - Card payments and cash on delivery
- **Order History** - View past orders and receipts

### 🏪 Restaurant Features
- **Restaurant Registration** - Onboarding for restaurant owners
- **Menu Management** - Add, edit, and manage menu items
- **Order Management** - Receive and process customer orders
- **Order Verification** - Verify and update order status

### 🚴 Delivery Features
- **Rider Dashboard** - Accept and manage delivery assignments
- **Real-time Location** - Live rider location tracking
- **Route Optimization** - Navigation to restaurants and customers
- **Delivery History** - Track completed deliveries and earnings

## 🏗️ Architecture

### Microservices Structure

Foodie Platform
├── 🏠 User Service (5000) - Authentication & user management
├── 🏪 Restaurant Service (5001) - Restaurant & menu management
├── 💰 Payment Service (5002) - Payment processing
├── 📦 Order Service (5003) - Order management
├── 🔔 Notification Service (5004) - Notifications & alerts
├── 🚚 Delivery Service (5005) - Delivery & rider management
└── 🌐 Frontend (React) - User interface

### Technology Stack
- **Frontend**: React, React Router, Leaflet Maps, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io for live updates
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Stripe integration (optional)
- **Maps**: Leaflet with OpenStreetMap

## 📦 Installation & Setup

### Prerequisites
- Node.js 
- MongoDB 
- npm or yarn

### 1. Clone the Repository

### 2. Database Setup
# Make sure MongoDB is running
mongod

# The services will create necessary collections automatically

### 3. Backend Setup
cd server
cd user-service

cd server
cd restaurant-service

cd server
cd payment-service

cd server
cd order-service

cd server
cd delivery-service

---
# Set up environment variables
cp .env.example .env
# Edit .env with your configurations

---for each terminal
npm install
npm run dev

### 4. Frontend Setup
cd client
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API URLs

# Running the Application
# From backend directory
npm run dev:all
# From frontend directory  
npm run dev

# Backend (.env)-------------------------------
# Database
MONGODB_URI=mongodb://localhost:27017/foodie
DB_NAME=foodie

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Service Ports
USER_SERVICE_PORT=5000
RESTAURANT_SERVICE_PORT=5001
PAYMENT_SERVICE_PORT=5002
ORDER_SERVICE_PORT=5003
NOTIFICATION_SERVICE_PORT=5004
DELIVERY_SERVICE_PORT=5005

# Payment (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Frontend (.env)-----------------------------
VITE_USER_SERVICE_URL=http://localhost:5000/api
VITE_RESTAURANT_SERVICE_URL=http://localhost:5001/api
VITE_PAYMENT_SERVICE_URL=http://localhost:5002/api
VITE_ORDER_SERVICE_URL=http://localhost:5003/api
VITE_NOTIFICATION_SERVICE_URL=http://localhost:5004/api
VITE_DELIVERY_SERVICE_URL=http://localhost:5005/api

👥 User Roles
1. Customer
Browse restaurants and menus

Place orders and make payments

Track deliveries in real-time

View order history

2. Restaurant Owner
Register and manage restaurant

Add and update menu items

Process and verify orders

View restaurant analytics

3. Delivery Rider
Accept delivery assignments

Update delivery status

Real-time location sharing

View delivery history and earnings

📱 Usage Guide
For Customers
Register/Login - Create an account or sign in

Browse Restaurants - Explore available restaurants

Add Items to Cart - Select desired food items

Checkout - Choose delivery location and payment method

Track Order - Monitor order preparation and delivery

For Restaurant Owners
Register Restaurant - Complete restaurant profile

Setup Menu - Add food items with prices and images

Manage Orders - Accept/reject and update order status

Track Performance - Monitor orders and revenue

For Delivery Riders
Go Online - Set availability for deliveries

Accept Deliveries - Review and accept nearby orders

Update Status - Mark orders as collected/delivered

Share Location - Enable real-time tracking


---------------------------------------------------------

<!-- # Screenshots

# Dark Mode Screenshots

## HomePage
![Dark Mode](assets/dark-home.png)
## LeaderBoard
![Dark Mode](assets/dark-leaderboard-highScore.png)
## Quiz List
![Dark Mode](assets/dark-quizList.png)

# Teacher Dashboard

## Profile
![Dark Mode](assets/teacher/dark-profile.png)
## Create Quiz
![Dark Mode](assets/teacher/dark-createQuiz.png)
## Edit and Delete Quiz and questions
![Dark Mode](assets/teacher/dark-editQuiz.png)

# Student Dashboard

## Profile
![Dark Mode](assets/student/dark-profile.png)
## Start Quiz
![Dark Mode](assets/student/dark-startQuiz.png)
## Questions
![Dark Mode](assets/student/dark-questions.png)
## Result
![Dark Mode](assets/student/dark-result.png)
## Mistake Review
![Dark Mode](assets/student/dark-mistakeReview.png)
## Score History with graph comparison and Generate Report
![Dark Mode](assets/student/dark-myScore.png)

# Light Mode Screenshots

## HomePage
![Light Mode](assets/home.png)
## LeaderBoard
![Light Mode](assets/leaderboard-highScore.png)
## Quiz List
![Light Mode](assets/quizList.png)

# Teacher Dashboard

## Profile
![Light Mode](assets/teacher/profile.png)
## Create Quiz
![Light Mode](assets/teacher/createQuiz.png)
## Edit and Delete Quiz and questions
![Light Mode](assets/teacher/editQuiz.png)

# Student Dashboard

## Profile
![Light Mode](assets/student/profile.png)
## Start Quiz
![Light Mode](assets/student/startQuiz.png)
## Questions
![Light Mode](assets/student/questions.png)
## Result
![Light Mode](assets/student/result.png)
## Mistake Review
![Light Mode](assets/student/mistakeReview.png)
## Score History with graph comparison and Generate Report
![Light Mode](assets/student/myScore.png) -->
