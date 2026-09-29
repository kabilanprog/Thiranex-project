# Online Course Enrollment System (Mini LMS)

A full stack web application in which **students** browse and enroll in courses, and **admins** manage courses and enrollments.
Built during the Full Stack Development internship at **Thiranex – Skill Development & Future Tech** (07 Jul 2026 – 06 Aug 2026).

**Developed by:** Kabilan S (720723110043), B.Tech Information Technology, Hindusthan College of Engineering and Technology, Coimbatore
**Mentor:** Mr. Hariharan M, Founder & CEO, Thiranex

## Tech stack

| Layer      | Technologies                                   |
| ---------- | ---------------------------------------------- |
| Front-end  | HTML5, CSS3, JavaScript, Bootstrap             |
| Back-end   | Node.js, Express.js, REST API, JWT, bcryptjs   |
| Database   | MongoDB with Mongoose                          |
| Tools      | Postman, Git, GitHub                           |

## Project structure

```
online-course-enrollment-system/
|-- backend/
|   |-- config/db.js
|   |-- controllers/   authController.js, courseController.js, enrollmentController.js
|   |-- middleware/    authMiddleware.js, errorHandler.js
|   |-- models/        User.js, Course.js, Enrollment.js
|   |-- routes/        authRoutes.js, courseRoutes.js, enrollmentRoutes.js, adminRoutes.js
|   |-- .env
|   |-- package.json
|   `-- server.js
|-- database/
|   `-- seed.js            (sample data: users, courses, enrollments)
|-- frontend/
|   |-- css/style.css
|   |-- js/app.js
|   |-- login.html
|   |-- dashboard.html
|   |-- courses.html
|   `-- enroll.html
|-- package.json
`-- README.md
```

## How to run

**Prerequisites:** Node.js 18+ and MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string.

```bash
# 1. install back-end packages
npm run setup            # same as: cd backend && npm install

# 2. (optional) edit backend/.env  ->  MONGO_URI, JWT_SECRET, PORT

# 3. load the sample data
npm run seed

# 4. start the server
npm start                # or: npm run dev  (auto-restart with nodemon)
```

Open **http://localhost:5000** in the browser. The Express server also serves the `frontend/` pages, so no extra setup is needed.

### Sample logins (password for all: `Pass1234`)

| Role    | Email                    |
| ------- | ------------------------ |
| Student | kabilan@student.edu      |
| Student | divya@student.edu        |
| Student | arun@student.edu         |
| Admin   | hariharan@thiranex.in    |
| Admin   | priya@thiranex.in        |

## Features

**Student:** register and log in · view the dashboard with enrollment status · browse available courses · enroll in a course with a preferred batch.

**Admin:** add, update and delete courses · view and manage all student enrollments (change status, cancel).

**Other:** JWT authentication · role-based access (`adminOnly`) · passwords hashed with bcrypt · seat count reduced automatically on enrollment · duplicate enrollment blocked · input validation and central error handling.

## REST API

| Method | Endpoint                        | Access  | Description                        |
| ------ | ------------------------------- | ------- | ---------------------------------- |
| POST   | `/api/auth/register`            | Public  | Register a new student             |
| POST   | `/api/auth/login`               | Public  | Log in, returns JWT token          |
| GET    | `/api/courses`                  | Public  | List all courses                   |
| GET    | `/api/courses/:id`              | Public  | Get one course                     |
| POST   | `/api/enroll`                   | Student | Enroll in a course (`courseId`, `batch`) |
| GET    | `/api/my-enrollments`           | Student | Enrollments of the logged-in user  |
| POST   | `/api/admin/courses`            | Admin   | Add a course                       |
| PUT    | `/api/admin/courses/:id`        | Admin   | Update a course                    |
| DELETE | `/api/admin/courses/:id`        | Admin   | Delete a course                    |
| GET    | `/api/admin/enrollments`        | Admin   | View all enrollments               |
| PUT    | `/api/admin/enrollments/:id`    | Admin   | Change enrollment status           |
| DELETE | `/api/admin/enrollments/:id`    | Admin   | Cancel an enrollment               |

Protected routes need the header `Authorization: Bearer <token>`.

## Database collections

- **users** – name, email (unique), password (hashed), role (`student` / `admin`), timestamps
- **courses** – title, description, category, instructor, duration, seatsAvailable, timestamps
- **enrollments** – student (ref User), course (ref Course), batch, enrolledOn, status (`active` / `completed`)

## Test cases covered (Postman + manual)

| ID    | Scenario                               | Expected result                          |
| ----- | -------------------------------------- | ---------------------------------------- |
| TC-01 | Register with valid data               | Account created successfully             |
| TC-02 | Register with duplicate email          | Error: Email already registered          |
| TC-03 | Login with correct credentials         | Login successful, token returned         |
| TC-04 | Login with incorrect password          | Error: Invalid credentials               |
| TC-05 | View course list without login         | Courses displayed publicly               |
| TC-06 | Enroll in a course with seats          | Enrollment created, seats reduced by 1   |
| TC-07 | Enroll in a full course                | Error: No seats available                |
| TC-08 | Enroll without login                   | Error: No token, access denied           |
| TC-09 | Admin views all enrollments            | List of all student enrollments          |
| TC-10 | Non-admin accesses admin route         | Error: Access denied: Admins only        |
