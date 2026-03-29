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
