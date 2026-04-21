# Alumni Management System

A full-stack web application designed to connect students with alumni for mentorship, networking, and career growth.

## ✨ Features

- **AI Resume Analyzer**: Automatic skill extraction and improvement suggestions.
- **Mentor Matching**: Connect with alumni based on career goals and interests.
- **Real-time Chat**: Seamless communication between students and mentors.
- **Job Board**: Alumni can post opportunities; students can apply.
- **Firebase Integration**: Secure authentication and storage.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- A Firebase Project (for Auth, Firestore, and Storage)

### 1. Clone the Repository

```bash
git clone https://github.com/anuraag004/Alumni-Management-System.git
cd Alumni-Management-System
```

### 2. Backend Setup (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your `JWT_SECRET`, Firebase Admin SDK credentials, and SMTP settings.
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup (Client)

1. Navigate to the client directory (from the root):
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Firebase Client SDK configuration.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Firebase (Firestore)
- **Real-time**: Socket.io
- **AI**: Integration with resume parsing logic

## 🔒 Security Note

**Never** commit your `.env` files. The project contains a `.gitignore` that automatically excludes these for your safety. Always use the provided `.env.example` templates for deployment.
