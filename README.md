## 🚀 Getting Started

This is a full-stack e-commerce application built with the MERN stack (MongoDB, Express, React/Next.js, Node.js).

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Paynow](https://www.paynow.co.zw/) Developer Account
- [Git](https://git-scm.com/)

---

## ⚙️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/wyzar-ecommerce.git](https://github.com/YOUR_USERNAME/wyzar-ecommerce.git)
    cd wyzar-ecommerce
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

---

## 🔑 Environment Variables

This project requires environment variables to run.

### Backend (`/backend`)

Create a file named `.env` in the `/backend` folder and add the following variables:

```bash
# Server Configuration
PORT=5001

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JSON Web Token
JWT_SECRET=your_jwt_secret_key

# Paynow Integration
PAYNOW_INTEGRATION_ID=your_paynow_integration_id
PAYNOW_INTEGRATION_KEY=your_paynow_integration_key
PAYNOW_RETURN_URL=http://localhost:3000/order/success

# In frontend/.env.local

NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
