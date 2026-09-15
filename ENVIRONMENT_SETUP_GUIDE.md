# 🛠️ Spice Avenue - Complete Environment Setup & Configuration Guide

**SE2030 Software Engineering | SLIIT Year 2 Semester 1**  
This guide provides step-by-step instructions for team members and evaluators to set up, configure, and run the **Spice Avenue** project from scratch on a new machine (Windows / macOS / Linux).

---

## 📋 Prerequisites Checklist

Ensure the following software packages are installed on your machine:

| Component | Minimum Version | Recommended Version | Download Link |
| :--- | :--- | :--- | :--- |
| **Java JDK** | Java 17 LTS | **Java 21 LTS** (Eclipse Temurin) | [Adoptium Temurin 21](https://adoptium.net/) |
| **Node.js & npm** | Node 18.x LTS | **Node 20.x / 22.x LTS** | [Node.js Official](https://nodejs.org/) |
| **Database** | MySQL 8.0 | **MySQL 8.4 LTS / Docker** | [Docker Desktop](https://www.docker.com/) or [MySQL Community](https://dev.mysql.com/downloads/installer/) |
| **Build Tool** | Apache Maven 3.8+ | Bundled with IntelliJ / Maven Wrapper | [Maven Official](https://maven.apache.org/) |
| **IDE** | - | **IntelliJ IDEA Community / Ultimate** (Backend) & **VS Code** (Frontend) | [JetBrains IntelliJ](https://www.jetbrains.com/idea/) |
| **Version Control** | Git 2.30+ | Latest | [Git SCM](https://git-scm.com/) |

---

## 🚀 Step 1: System Environment Verification

Open your terminal or PowerShell and verify your installed tool versions:

```powershell
# 1. Verify Java JDK
java -version
javac -version

# 2. Verify Node.js & npm
node -v
npm -v

# 3. Verify Git
git --version
```

> ⚠️ **Windows PowerShell Script Fix**:  
> If running `npm` produces the error `running scripts is disabled on this system`, run this once:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> Type **`Y`** and press **Enter**.

---

## 🗄️ Step 2: MySQL Database Setup

Choose **ONE** of the following 3 options based on your preference:

### Option A: Docker (Fastest & Recommended ⭐)
If you have **Docker Desktop** installed:
```powershell
# 1. Run the MySQL 8 container:
docker run --name spice-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=spice_avenue_db -p 3306:3306 -d mysql:8.4

# 2. Import the Database Schema (12 Tables):
Get-Content "database/schema.sql" | docker exec -i spice-mysql mysql -u root -proot spice_avenue_db

# 3. Import Seed Data (Pre-seeded branches, users, menus, orders):
Get-Content "database/seed_data.sql" | docker exec -i spice-mysql mysql -u root -proot spice_avenue_db
```

### Option B: Native MySQL Server / MySQL Workbench
1. Open **MySQL Workbench** or MySQL Command Line Client.
2. Execute the following commands:
   ```sql
   CREATE DATABASE spice_avenue_db;
   USE spice_avenue_db;
   ```
3. Open and execute [`database/schema.sql`](database/schema.sql).
4. Open and execute [`database/seed_data.sql`](database/seed_data.sql).

### Option C: XAMPP (phpMyAdmin)
1. Start the **MySQL** module in **XAMPP Control Panel**.
2. Go to `http://localhost/phpmyadmin` in your browser.
3. Create a new database named `spice_avenue_db`.
4. Click **Import** $\rightarrow$ select `database/schema.sql` $\rightarrow$ click **Go**.
5. Click **Import** $\rightarrow$ select `database/seed_data.sql` $\rightarrow$ click **Go**.

---

## ☕ Step 3: Backend Configuration & Startup (Spring Boot)

### 1. Database Connection Settings
Open [`backend/src/main/resources/application.properties`](backend/src/main/resources/application.properties) and ensure the credentials match your MySQL setup:

```properties
# Server Port
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/spice_avenue_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root

# Hibernate / JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Security Secret
app.jwt.secret=9a61e5c2872322d71f694e9f86b527d5cc7d00d8a22969e3e920262453416e111e17f48a9e1e1e1e1e1e1e1e1e1e1e1e
app.jwt.expiration-ms=86400000
```
*(Note: If using XAMPP default MySQL without password, set `spring.datasource.password=`)*

### 2. Setting up in IntelliJ IDEA
1. Open IntelliJ IDEA $\rightarrow$ click **Open** $\rightarrow$ select the `backend` folder (or open `backend/pom.xml` as a project).
2. Go to **File $\rightarrow$ Project Structure $\rightarrow$ Project**:
   * **SDK**: Select **Java 21** (or Java 17).
   * **Language Level**: Set to **SDK default** (or 21 / 17).
3. **Enable Annotation Processing (Important for Lombok)**:
   * Go to **File $\rightarrow$ Settings** (`Ctrl + Alt + S`).
   * Navigate to **Build, Execution, Deployment $\rightarrow$ Compiler $\rightarrow$ Annotation Processors**.
   * Check **✅ Enable annotation processing** $\rightarrow$ Click **OK**.
4. **Run the Backend**:
   * Navigate to `src/main/java/com/spiceavenue/SpiceAvenueApplication.java`.
   * Click the green **▶️ Run** button.

### 3. Or Running via Terminal (Maven):
```powershell
cd backend
mvn spring-boot:run
```

### 4. Verify Backend Health & Swagger API Docs:
Open your browser and visit:
👉 **`http://localhost:8080/swagger-ui.html`**

---

## 🎨 Step 4: Frontend Configuration & Startup (React + Vite)

### 1. Install Dependencies & Start Dev Server
Open a **new** terminal window:

```powershell
# 1. Navigate to the frontend directory
cd frontend

# 2. Install NPM packages (one-time setup)
npm install

# 3. Start the Vite development server
npm run dev
```

### 2. Access the Application:
Open your browser and visit:
👉 **`http://localhost:5173`**

---

## 🔑 Step 5: Test Logins & 1-Click Role Switcher

All pre-seeded test accounts use the universal password: **`Password123!`**

| Role | Email | Module Tested |
| :--- | :--- | :--- |
| **🛒 Customer** | `customer.john@gmail.com` | **Member 3 & 6**: Cart, Pickup/Delivery checkout, Address book, Live order tracking, Reviews, Complaints |
| **👨‍🍳 Branch Manager** | `manager.colombo@spiceavenue.com` | **Member 2 & 4**: Menu item CRUD, Dynamic portions, Stock toggle, Live kitchen order queue, Rider assignment |
| **🚴 Delivery Rider** | `rider.kamal@spiceavenue.com` | **Member 5**: Shift toggle (`Available`/`Busy`/`Offline`), Task acceptance, *Out for Delivery* $\rightarrow$ *Delivered* |
| **🎧 CS Supervisor** | `supervisor@spiceavenue.com` | **Member 6**: Customer satisfaction analytics, 1-5 star ratings breakdown, Complaint resolution workflow |
| **📍 Operations Manager** | `ops@spiceavenue.com` | **Member 1**: Multi-branch management, Non-GPS coverage zones, Revenue/orders performance stats |
| **🛡️ System Admin** | `admin@spiceavenue.com` | System-wide administrator privileges across all 6 portals |

> 💡 **Viva 1-Click Feature**: On the **`/login`** page, click any of the role cards on the right side to automatically sign in without typing passwords!

---

## ❓ Troubleshooting & Common Errors

### 1. `Port 8080 already in use`
* **Cause**: Another application or an older Spring Boot process is running on port 8080.
* **Fix**: In PowerShell:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
  ```

### 2. `Port 3306 already in use`
* **Cause**: You have both a local MySQL server (or XAMPP) and a Docker container running on port 3306.
* **Fix**: Either stop the native MySQL service in Windows Services (`services.msc`), or stop the Docker container (`docker stop spice-mysql`).

### 3. `Access denied for user 'root'@'localhost'`
* **Cause**: The password in `application.properties` does not match your MySQL server password.
* **Fix**: Update `spring.datasource.password` in `backend/src/main/resources/application.properties` to match your MySQL root password.

### 4. IntelliJ shows red lines on getters / setters (Lombok)
* **Fix**: Enable annotation processing in IntelliJ: **Settings $\rightarrow$ Build, Execution, Deployment $\rightarrow$ Compiler $\rightarrow$ Annotation Processors $\rightarrow$ Check "Enable annotation processing"**.
