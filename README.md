# Food Waste Reduction Platform - Backend (Server)

This is the **backend server** for the Food Waste Reduction Platform built using the **MERN Stack**. It handles authentication, API requests, database operations, notifications, and business logic for managing food donations between donors, NGOs, and administrators.

---

## Features

- User Authentication (JWT-based login & registration)
- Role-based access (Donor / NGO / Admin)
- Food donation management APIs
- Request & approval system for food sharing
- Admin control for monitoring activities
- Email notifications for updates
- RESTful API architecture

---

## Tech Stack

- **Node.js** – Runtime environment
- **Express.js** – Backend framework
- **MongoDB** – NoSQL database
- **Mongoose** – ODM for MongoDB
- **JWT (JSON Web Token)** – Authentication
- **Nodemailer** – Email service
- **Dotenv** – Environment variable management
- **CORS & Middleware** – API handling

---

##  Project Structure


server/
│
├── models/ # Database schemas (User, Food, Requests)
├── routes/ # API routes
├── controllers/ # Business logic
├── middleware/ # Auth middleware, error handling
├── config/ # Database connection setup
├── utils/ # Helper functions (email, tokens)
├── index.js # Main server entry point
├── .env # Environment variables
└── package.json


---

##  Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/food-waste-platform.git
2. Navigate to server folder
cd server
3. Install dependencies
npm install
Environment Variables

Create a .env file in the server directory and add:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
 Running the Server
Development mode
npm run dev
Production mode
npm start
API Endpoints (Sample)
Auth Routes
POST /api/auth/register – Register user
POST /api/auth/login – Login user
Food Routes
POST /api/food/add – Add food donation
GET /api/food/all – Get all available food
Request Routes
POST /api/request/send – Send food request
PUT /api/request/update – Update request status
Admin Routes
GET /api/admin/dashboard – View system stats
 Security Features
Password hashing (bcrypt)
JWT authentication
Protected routes for admin access
Input validation and error handling
