# 🌶️ Spice Avenue - Multi-Branch Web-Based Food Ordering Platform

**SE2030 - Software Engineering (SLIIT Year 2 Semester 1)**  
Group Project: Multi-Branch Restaurant Management & Customer Ordering System

---

## 🏗️ Tech Stack
* **Backend**: Java 17 / 21, Spring Boot 3.x, Spring Data JPA, Spring Security (JWT), Jakarta Validation, Springdoc OpenAPI (Swagger)
* **Frontend**: React 18 (Vite), Tailwind CSS, Axios, Lucide-React, React Router DOM
* **Database**: MySQL 8.x
* **Documentation**: Full specs in [PROJECT_MASTER_GUIDE.md](PROJECT_MASTER_GUIDE.md)

---

## 👥 Module Allocation
* **Member 1**: Branch Management & Delivery Areas (`/api/branches`)
* **Member 2**: Menu & Category Management (`/api/menu-items`, `/api/categories`)
* **Member 3**: Customer Ordering & Cart (`/api/customer/orders`, `/api/customer/addresses`)
* **Member 4**: Order Fulfillment & Kitchen Queue (`/api/fulfillment/orders`)
* **Member 5**: Delivery Rider Operations (`/api/delivery`)
* **Member 6**: Complaint & Review Management (`/api/customer/complaints`, `/api/customer/reviews`)

---

## ⚡ Quick Start Guide

### 1. Database Setup
1. Open MySQL Workbench, phpMyAdmin, or terminal:
   ```sql
   CREATE DATABASE spice_avenue_db;
   USE spice_avenue_db;
   ```
2. Run `database/schema.sql` to generate all tables and constraints.
3. Run `database/seed_data.sql` to populate sample branches, menus, and accounts.

### 2. Backend Setup (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Verify `src/main/resources/application.properties` credentials:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *(Or on Windows: `mvnw.cmd spring-boot:run` or launch in IntelliJ / Eclipse)*
4. Access Swagger UI for interactive API testing:
   👉 **http://localhost:8080/swagger-ui.html**

### 3. Frontend Setup (React + Vite)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Access the web app:
   👉 **http://localhost:5173**

---

## 🔑 Pre-Seeded Test Accounts (Default Password: `Password123!`)

| Role | Email | Use Case / Portal |
| :--- | :--- | :--- |
| **System Admin** | `admin@spiceavenue.com` | Full system access & role assignment |
| **Operations Manager** | `ops@spiceavenue.com` | Member 1 (Branch CRUD & Delivery Areas) |
| **Branch Manager (Colombo)** | `manager.colombo@spiceavenue.com` | Member 2 & 4 (Menu & Order Fulfillment) |
| **Branch Manager (Negombo)** | `manager.negombo@spiceavenue.com` | Member 2 & 4 (Negombo branch operations) |
| **Delivery Rider 1** | `rider.kamal@spiceavenue.com` | Member 5 (Colombo Deliveries) |
| **Delivery Rider 2** | `rider.nimal@spiceavenue.com` | Member 5 (Colombo Deliveries) |
| **CS Supervisor** | `supervisor@spiceavenue.com` | Member 6 (Complaint Resolution & Feedback) |
| **Customer** | `customer.john@gmail.com` | Member 3 & 6 (Ordering, Reviews, Complaints) |
