
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



## 🏗️ System Architecture

### Microservices Structure

| Service | Port | Description | Key Responsibilities |
|---------|------|-------------|---------------------|
| **User Service** | `5000` | Authentication & user management | User registration, login, profiles, JWT auth |
| **Restaurant Service** | `5001` | Restaurant & menu management | Restaurant CRUD, menu items, verification |
| **Payment Service** | `5002` | Payment processing | Payment gateway, transactions, webhooks |
| **Order Service** | `5003` | Order management | Order lifecycle, status updates, history |
| **Notification Service** | `5004` | Notifications & alerts | Email, SMS, push notifications |
| **Delivery Service** | `5005` | Delivery & rider management | Rider assignment, real-time tracking |
| **Frontend** | `3000` | React application | User interface, real-time updates |

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
## From backend directory
npm run dev:all
## From frontend directory  
npm run dev

# Backend (.env)-------------------------------
## Database
MONGODB_URI=mongodb://localhost:27017/foodie
DB_NAME=foodie

## JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

## Service Ports
USER_SERVICE_PORT=5000
RESTAURANT_SERVICE_PORT=5001
PAYMENT_SERVICE_PORT=5002
ORDER_SERVICE_PORT=5003
NOTIFICATION_SERVICE_PORT=5004
DELIVERY_SERVICE_PORT=5005

## Payment (Stripe)
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

# Screenshots

# Dark Mode Screenshots

## Customer
![Dark Mode](assets/d_home.png)
![Dark Mode](assets/d_customer_signup.png)
![Dark Mode](assets/d_signin.png)
![Dark Mode](assets/d_signin.png)
![Dark Mode](assets/d_restaurants.png)
![Dark Mode](assets/d_1_res.png)
![Dark Mode](assets/d_cart.png)
![Dark Mode](assets/d_cus_profile.png)
![Dark Mode](assets/d_delivery_tracking_accepted.png)
![Dark Mode](assets/d_delivery_tracking_completed.png)
![Dark Mode](assets/d_edit_profile.png)
![Dark Mode](assets/d_location_confirm.png)
![Dark Mode](assets/d_order_history.png)
![Dark Mode](assets/d_order_placed.png)
![Dark Mode](assets/d_payment_type.png)
![Dark Mode](assets/d_search_menu.png)
![Dark Mode](assets/d_search_res.png)
![Dark Mode](assets/d_view_order_history_details.png)
![Dark Mode](assets/payment_by_card.png)

## Restaurant Admin
![Dark Mode](assets/d_restaurant_admin_profile.png)
![Dark Mode](assets/d_res_owner_details_profile.png)
![Dark Mode](assets/d_res_details_edit_profile.png)
![Dark Mode](assets/d_res_menu_items_profile.png)
![Dark Mode](assets/d_res_pending.png)
![Dark Mode](assets/d_res_verified_orders.png)
![Dark Mode](assets/d_res_verified_order_details.png)
![Dark Mode](assets/d_res_verified_order_details_see_more.png)

## Admin
![Dark Mode](assets/d_admin_verify_restaurant.png)

## Rider
![Dark Mode](assets/d_rider_signup.png)


# Light Mode Screenshots

## Customer
![Light Mode](assets/l_home.png)
![Light Mode](assets/l_customer_signup.png)
![Light Mode](assets/l_signin.png)
![Light Mode](assets/l_restaurants.png)
![Light Mode](assets/l_1_res.png)
![Light Mode](assets/l_cart.png)
![Light Mode](assets/l_cus_profile.png)
![Light Mode](assets/l_delivery_tracking_accepted.png)
![Light Mode](assets/l_delivery_tracking_completed.png)
![Light Mode](assets/l_edit_profile.png)
![Light Mode](assets/l_location_confirm.png)
![Light Mode](assets/l_location_confirm.png)
![Light Mode](assets/l_order_placed.png)
![Light Mode](assets/l_payment_type.png)
![Light Mode](assets/l_search_menu.png)
![Light Mode](assets/l_search_res.png)
![Light Mode](assets/l_view_order_history_details.png)
![Light Mode](assets/payment_by_card.png)

## Restaurant Admin
![Light Mode](assets/l_restaurant_admin_profile.png)
![Light Mode](assets/l_res_owner_details_profile.png)
![Light Mode](assets/l_res_details_edit_profile.png)
![Light Mode](assets/l_res_menu_items_profile.png)
![Light Mode](assets/l_res_pending.png)
![Light Mode](assets/l_res_verified_orders.png)
![Light Mode](assets/l_res_verified_order_details.png)
![Light Mode](assets/l_res_verified_order_details_see_more.png)

## Admin
![Light Mode](assets/l_admin_verify_restaurant.png)

## Rider
![Light Mode](assets/l_rider_signup.png)

