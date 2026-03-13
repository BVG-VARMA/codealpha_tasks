# CodeAlpha Internship Projects

Projects completed during the **CodeAlpha Full Stack Development Internship**.

---

## Projects

| #   | Folder                        | Project                 | Tech Stack                                     |
| --- | ----------------------------- | ----------------------- | ---------------------------------------------- |
| 1   | `CodeAlpha_Shopease`          | E-Commerce Store        | Express.js · SQLite · HTML/CSS/JS              |
| 2   | `CodeAlpha_Nexly_SocialMedia` | Social Media Platform   | Express.js · PostgreSQL · HTML/CSS/JS          |
| 3   | `CodeAlpha_Trellix`           | Project Management Tool | Express.js · MongoDB · Socket.IO · HTML/CSS/JS |

---

## Task 1 — Shopease (E-Commerce Store)

Shopease is a full stack e-commerce web application that simulates a real-world online shopping experience. It handles everything from browsing products to placing orders, with a secure authentication system and a relational database managing all data.

### Features

**Authentication & Users**

- User registration with hashed passwords using bcrypt
- Login with JWT-based session management
- Protected routes that require authentication before accessing cart or orders
- Persistent login using tokens stored in the browser

**Product Management**

- Dynamic product listing page fetched from the database
- Individual product detail pages showing name, price, description, and image
- Products stored and managed in an SQLite database
- Clean and responsive product grid layout

**Shopping Cart**

- Add products to cart from listing or detail page
- Update item quantities directly in the cart
- Remove individual items from the cart
- Cart total calculated dynamically on every change
- Cart data persisted per user in the database

**Order Processing**

- Checkout flow that converts the cart into a confirmed order
- Orders saved to the database with timestamp and item details
- Order history page where users can view all past purchases
- Each order stores the product snapshot so price changes do not affect history

**Backend & Database**

- RESTful API built with Express.js
- SQLite database with tables for users, products, cart items, and orders
- Middleware for authentication, error handling, and request validation
- Structured folder layout separating routes, controllers, and models

**Tech Stack:** Node.js · Express.js · SQLite · JWT · bcrypt · HTML · CSS · JavaScript

---

## Task 2 — Nexly (Social Media Platform)

Nexly is a full stack social media platform that allows users to create profiles, share posts, interact through likes and comments, and build a following. It mirrors the core functionality of modern social networks with a clean and responsive interface.

### Features

**Authentication & Profiles**

- Secure registration and login with JWT authentication
- Each user has a dedicated profile page showing their bio, avatar, post count, followers, and following count
- Users can update their profile information and upload a custom avatar image
- Profile pages are publicly accessible and can be viewed by other users

**Posts**

- Users can create text posts with optional image attachments
- Posts are displayed in a chronological feed on the home page
- Feed shows posts from users that the logged-in user follows
- Each post shows the author name, avatar, timestamp, like count, and comment count
- Users can delete their own posts

**Comments**

- Users can comment on any post
- Comments are displayed below each post in threaded order
- Each comment shows the author and timestamp
- Users can like individual comments in addition to posts
- Comment count is displayed on the post card and updates in real time

**Like System**

- Toggle likes on posts and comments with a single click
- Like count updates instantly on the page without a full reload
- Users can view a list of everyone who liked a specific post via a modal popup
- Likes are stored per user so duplicate likes are prevented

**Follow System**

- Follow or unfollow any user from their profile page
- Follower and following counts update immediately on action
- The home feed filters posts to only show content from followed accounts
- Suggested or discovered users can be followed from their profile

**Image Uploads**

- Posts and avatars support image file uploads
- Images are stored on the server using Multer middleware
- Uploaded images are served statically and displayed in the feed and profile

**Backend & Database**

- RESTful API with Express.js covering auth, posts, comments, likes, follows, and users
- PostgreSQL relational database with normalized tables and foreign key relationships
- Separate migration files for each table for clean database setup
- JWT middleware protecting all write operations

**Tech Stack:** Node.js · Express.js · PostgreSQL · Multer · JWT · bcrypt · HTML · CSS · JavaScript

---

## Task 3 — Trellix (Project Management Tool)

Trellix is a full stack collaborative project management application inspired by tools like Trello and Asana. It allows teams to organize work into projects, break projects into tasks, communicate through comments, and receive live updates using WebSockets.

### Features

**Authentication & User Management**

- Secure registration and login with JWT authentication
- Passwords hashed with bcrypt before storage
- Protected API routes that reject unauthenticated requests
- User sessions managed via tokens on the client side

**Project Management**

- Users can create new projects with a name and description
- Projects act as workspaces containing all related tasks and team members
- Users can view all projects they are part of from the dashboard
- Project owners can manage project settings and members

**Task Management**

- Tasks are created within a project and assigned to specific team members
- Each task has a title, description, assigned user, priority level, and status
- Task statuses include To Do, In Progress, and Done — similar to a Kanban board
- Tasks can be updated, reassigned, or moved between status columns
- Dashboard gives a clear overview of all tasks and their current state

**Comments & Communication**

- Each task has its own comment thread for team discussion
- Users can post comments directly within a task card
- Comments display the author name and timestamp
- Provides a centralized place for task-specific communication without needing external tools

**Real-Time Updates with WebSockets**

- Socket.IO integration enables live updates across all connected clients
- When a task is created, updated, or moved, all users in the same project see the change instantly without refreshing the page
- Real-time notifications alert users when they are assigned a new task or when a comment is added to their task
- WebSocket events are scoped to project rooms so users only receive relevant updates

**Backend & Database**

- RESTful API built with Express.js for all CRUD operations
- MongoDB database with Mongoose schemas for users, projects, tasks, and comments
- Socket.IO runs alongside the Express server sharing the same HTTP instance
- Middleware handles authentication, error responses, and request logging
- Modular folder structure with separate files for routes, controllers, models, and socket logic

**Tech Stack:** Node.js · Express.js · MongoDB · Mongoose · Socket.IO · JWT · bcrypt · HTML · CSS · JavaScript

---

## Setup Instructions

Each project has its own independent backend. Follow these steps to run any project locally:

```bash
# 1. Navigate to the project backend folder
cd CodeAlpha_ProjectName/backend

# 2. Install all dependencies
npm install

# 3. Create a .env file and add the required environment variables
#    Example variables:
#    PORT=3000
#    JWT_SECRET=your_secret_key
#    DATABASE_URL=your_database_connection_string

# 4. Start the backend server
node server.js
```

Once the server is running, open the `frontend/index.html` or `frontend/login.html` file in your browser to use the application.

For PostgreSQL (Nexly), make sure PostgreSQL is running and run the migration files inside `backend/migrations/` in order before starting the server.

For MongoDB (Trellix), make sure MongoDB is running locally or provide a MongoDB Atlas connection string in the `.env` file.

---

## Author

**BVG-VARMA** — CodeAlpha Internship 2026
