<<<<<<< HEAD
# Reimbursement Management System

A full-stack web application designed to solve manual expense reimbursement problems in companies with multi-level approvals, multi-currency support, role-based access, and AI OCR receipt scanning.

## 🚀 Built With
- **Frontend**: React (Vite), Tailwind CSS, React Router DOM, React Hook Form, Axios, Lucide React
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt, Multer, Tesseract.js (OCR)
- **External APIs**: RestCountries API (Currency Mapping), ExchangeRate API (Currency Conversion)

## 📁 System Requirements
- Node.js (v18+)
- MongoDB running locally on port `27017`

## ⚙️ Installation & Setup

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`. It will automatically connect to MongoDB (`mongodb://localhost:27017/reimbursement`).

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend will start on your local Vite port (usually `http://localhost:5173`).

## 👥 Features & Roles

### Admin (Auto-created on company setup)
- Setup company workspace and auto-map company base currency.
- Manage user lifecycles, assign roles (Employee, Manager, Admin).
- Configure complex Approval Rules (Sequential queues, Percentage conditions, Specific "Golden Ticket" Approvers).

### Manager / Approver
- View pending expense claims specifically assigned to their queue.
- See amounts accurately converted into the Company base currency.
- Approve or reject with detailed comments.

### Employee
- Submit expenses in ANY international currency (auto-converted securely by open APIs).
- Upload receipt images. 
- Integrated AI OCR automatically extracts amounts and dates from uploaded receipts to save typing.
- View personal history and real-time status of their claims.

## 🗄️ Database Architecture
- `Users` (Hierarchy configured via `managerId`)
- `Companies`
- `Expenses` (Contains complex approval queuing array)
- `ApprovalRules` (Strategy patterns for logic execution)
=======
# reimbursement-management-odoo
# Reimbursement Management - Odoo Module

## Problem Statement
A custom Odoo module to automate employee expense reimbursement 
with multi-level approval workflows, multi-currency support, and OCR receipt scanning.

## Features
- Authentication & Role Management (Admin, Manager, Employee)
- Expense Submission with multi-currency support
- Sequential & Conditional Approval Workflows
- OCR Receipt Scanning
- Currency conversion via exchangerate API

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- React Hook Form
- Axios

### Backend
- Node.js
- Express.js
- JWT (Authentication)
- Bcrypt (Password Hashing)
- Multer (Receipt File Upload)
- Tesseract.js (OCR - Receipt Auto Read)

### Database
- MongoDB (Local) + Mongoose

### External APIs
- [RestCountries API](https://restcountries.com/v3.1/all?fields=name,currencies) — Country & Currency Data
- [ExchangeRate API](https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}) — Live Currency Conversion

### Tools
- Git & GitHub (Version Control)
- VS Code
- Postman (API Testing)

## Team
- Prathmesh Gondhalekar
- Raj Deshmukh
- Soham Patil
- Yash Bilwal
>>>>>>> dc7788876a8e98f841d9e41c0c3369e89e6ce816
