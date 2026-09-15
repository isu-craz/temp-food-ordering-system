# 🌶️ Spice Avenue - Multi-Branch Web-Based Food Ordering Platform

**SE2030 - Software Engineering (SLIIT Year 2 Semester 1)**  
Group Project: Multi-Branch Restaurant Management & Customer Ordering System

---

## 📖 Key Documentation Files
* 🛠️ **[ENVIRONMENT_SETUP_GUIDE.md](ENVIRONMENT_SETUP_GUIDE.md)**: **Complete Step-by-Step Environment & Machine Setup Guide** (Prerequisites, Docker/MySQL, IntelliJ, Node/Vite, and Troubleshooting).
* 📐 **[PROJECT_MASTER_GUIDE.md](PROJECT_MASTER_GUIDE.md)**: **Master Architecture & Viva Defense Reference** (6-member breakdown, DB Schema ERD, REST API catalog, state machines, and defense Q&A).

---

## 🏗️ Tech Stack
* **Backend**: Java 17 / 21 LTS, Spring Boot 3.2.3, Spring Data JPA (Hibernate 6), Spring Security 6 (JWT), Jakarta Validation, Springdoc OpenAPI (Swagger 2.3)
* **Frontend**: React 18 (Vite 5), Tailwind CSS 3.4, Axios, Lucide-React, React Router DOM 6
* **Database**: MySQL 8.x / 8.4 LTS

---

## 👥 6-Member Module Allocation
* **Member 1**: Branch Management & Non-GPS Delivery Areas (`/api/branches`)
* **Member 2**: Menu Category & Dynamic Size Variations Management (`/api/menu-items`, `/api/categories`)
* **Member 3**: Customer Ordering, Cart & Live Status Tracking (`/api/customer/orders`, `/api/customer/addresses`)
* **Member 4**: Order Fulfillment, Kitchen Preparation Queue & Rider Dispatch (`/api/fulfillment/orders`)
* **Member 5**: Delivery Management & Rider Progression (`/api/delivery`)
* **Member 6**: Customer Reviews, Ratings & Complaint Resolution (`/api/customer/complaints`, `/api/customer/reviews`)

---

## ⚡ Quick Start Summary

### 1. Database Setup
```powershell
# Run with Docker:
docker run --name spice-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=spice_avenue_db -p 3306:3306 -d mysql:8.4

# Import Schema & Seed Data:
Get-Content "database/schema.sql" | docker exec -i spice-mysql mysql -u root -proot spice_avenue_db
Get-Content "database/seed_data.sql" | docker exec -i spice-mysql mysql -u root -proot spice_avenue_db
```

### 2. Backend (Spring Boot)
```powershell
cd backend
mvn spring-boot:run
# Swagger UI Docs: http://localhost:8080/swagger-ui.html
```

### 3. Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
# Web App: http://localhost:5173
```

---

## 🔑 Pre-Seeded Test Accounts (Default Password: `Password123!`)

| Role | Email | Module / Portal |
| :--- | :--- | :--- |
| **System Admin** | `admin@spiceavenue.com` | Full administrative control |
| **Operations Manager** | `ops@spiceavenue.com` | Member 1 (Branch CRUD & Delivery Areas) |
| **Branch Manager (Colombo)** | `manager.colombo@spiceavenue.com` | Member 2 & 4 (Menu & Kitchen Fulfillment Queue) |
| **Branch Manager (Negombo)** | `manager.negombo@spiceavenue.com` | Member 2 & 4 (Negombo Branch Operations) |
| **Delivery Rider 1** | `rider.kamal@spiceavenue.com` | Member 5 (Delivery Operations) |
| **Delivery Rider 2** | `rider.nimal@spiceavenue.com` | Member 5 (Delivery Operations) |
| **CS Supervisor** | `supervisor@spiceavenue.com` | Member 6 (Feedback & Complaint Resolution) |
| **Customer** | `customer.john@gmail.com` | Member 3 & 6 (Ordering, Reviews, Complaints) |

> 💡 **Viva Tip**: On the **`/login`** page, use the **1-Click Role Switcher** on the right side to sign in as any role without typing passwords!
