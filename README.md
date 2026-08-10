#  LokVeda — Digital E-Gram Panchayat System

LokVeda is a full-stack E-Gram Panchayat Management System designed to digitize village-level governance and citizen services while maintaining security, accessibility, and ease of use for non-technical users.

The platform provides secure authentication, role-based service workflows, application review pipelines, area-wise service management, and citizen-centric service delivery through a modern web interface.

---



##  Project Overview

LokVeda simulates a real-world Panchayat service portal where citizens can:

* Apply for government services
* Track application status
* Re-submit rejected applications
* View approved services
* Access services available in their area

Staff members review applications and forward valid requests to administrators.

Administrators manage services, approve applications, and oversee Panchayat operations.

---

##  User Roles

###  Citizen

* Login using Aadhaar number and OTP
* Apply for active services
* View application status
* Re-submit rejected applications
* View profile information

###  Staff

* Review citizen applications
* Reject incomplete applications
* Forward valid applications to administrators
* Review previously rejected applications

###  Administrator

* Activate or deactivate services
* Approve reviewed applications
* Review rejected applications
* View approved applications
* Monitor service availability within their Panchayat

---

##  Core Features

###  Secure Authentication

* Aadhaar-based login
* Email OTP verification
* Crypto-generated OTP codes
* Hashed OTP storage using bcrypt
* JWT-based authentication
* Session token management
* Single active session per account

###  Location Verification

LokVeda performs geographic verification before OTP generation.

* Citizens: Allowed within registered states
* Staff: Allowed within 10 km of assigned area
* Administrators: Allowed within 250 km of assigned area

Location distance is displayed using user-friendly messages.

###  Security Controls

* Maximum login attempt protection
* Suspicious login detection
* Session validation
* Device tracking
* IP logging
* Location tracking
* Account lock mechanisms

###  Session Management

* Auth token during login
* Session token after verification
* Automatic session expiry
* Secure logout handling
* Protection against duplicate sessions

###  Dark Mode

* Automatic browser preference detection
* Local preference persistence
* Smooth transitions
* Available throughout the application

###  Greeting System

Dynamic greeting messages based on:

* User name
* Time of day
* Sunrise and sunset calculations

---

##  Application Workflow

### Citizen

Application Submitted

↓

Pending Review

↓

Reviewed by Staff

↓

Approved by Admin

---

### Rejection Flow

Application Submitted

↓

Rejected

↓

Citizen Corrects Application

↓

Re-submitted

↓

Review Process Continues

---

##  Service Management

Administrators can activate or deactivate services independently for each Panchayat area.

Citizens only see:

* Active services
* Rejected applications eligible for correction

Applications already pending, reviewed, or approved are hidden from the service application page.

---

##  Available Services

* Birth Certificate
* Death Certificate
* Property Certificate
* Property Tax
* Water Tax
* MGNREGA Registration
* RTI Application
* Land Records
* Welfare Schemes
* Subsidies
* Grievance Submission
* Skill Training
* Employment Assistance
* Health Checkup Registration
* Sanitation Requests
* Public Notices
* Public Works Information
* Election Updates
* Voter ID Services
* Voter List Services
* Tenders
* Government Dues

---

## Forms Supported

The system currently supports 22 government services:

* Birth Certificate
* Death Certificate
* Property Registration
* Land Records
* Property Tax
* Water Tax
* Grievance Submission
* RTI Requests
* MGNREGA Registration
* Welfare Schemes
* Subsidies
* Skill Training
* Employment Assistance
* Health Checkup Registration
* Sanitation Requests
* Election Updates
* Voter ID Services
* Voter List Verification
* Public Notices
* Public Works Tracking
* Government Tenders
* Utility Dues

---

## Architecture Overview

```text
Client Browser
      │
      ▼
 Express Routes
      │
      ▼
 Controllers
      │
      ▼
 Middleware
      │
      ▼
 Mongoose Models
      │
      ▼
 MongoDB Database
```

### Security Layers

1. Aadhaar Validation
2. Location Verification
3. OTP Verification
4. JWT Authentication
5. Session Validation
6. Role-Based Authorization
7. Service Access Control
8. Account Locking Protection

---

## Core Modules

### Authentication Module

* Aadhaar Verification
* Email OTP Verification
* JWT Authentication
* Device Session Tracking
* Suspicious Login Detection

### Service Module

* Dynamic Form Rendering
* Application Submission
* Application Review
* Application Approval
* Application Rejection

### Administration Module

* Service Activation
* Service Deactivation
* Area-wise Management
* Application Approval Workflow

### Dashboard Module

* Citizen Dashboard
* Staff Dashboard
* Admin Dashboard

### UI Module

* Dark Mode
* Responsive Design
* Dynamic Navigation
* Friendly Status Messaging
* Area-aware Footer

---

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* EJS

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT
* bcrypt
* crypto
* validator

### Communication

* Nodemailer

###  Deployment Infrastructure

* Render — Application hosting and deployment platform used for running the Node.js and Express.js server in a cloud environment.
* Cloudflare (Planned / Future Integration) — Intended for DNS management, performance optimization, SSL enhancement, caching, and protection against automated bots and malicious traffic.

---

##  Architecture

LokVeda follows the MVC (Model-View-Controller) architecture.

### Models

* User
* Service
* Area
* Polygon

### Controllers

* Authentication Controller
* Dashboard Controller
* Service Controller

### Middleware

* Authentication Middleware
* Session Validation
* Authorization Checks

### Views

* Home
* Authentication
* Dashboard
* Profile
* Services
* Applications
* Status Tracking

---

##  User Experience Highlights

* Friendly status messages
* Responsive layouts
* Area-aware service visibility
* Rejected form auto-fill
* Consistent navigation system
* Accessible visual hierarchy
* Low learning curve for rural users

---

##  Current Limitations

* File uploads not implemented
* PDF generation not implemented
* Document downloads not implemented
* Search functionality postponed
* Notifications not implemented
* Analytics dashboard not implemented

---

##  Future Scope

* File upload support
* PDF generation
* Digital document downloads
* SMS notifications
* Advanced analytics
* Search and filtering
* Multi-language support
* Mobile application
* Profile images currently use demonstration avatars stored locally within the application. User-uploaded profile images and cloud-based media storage are planned for future releases
* Custom domain integration through Cloudflare
* Enhanced security using Cloudflare bot protection and traffic filtering
* Global content delivery optimization through Cloudflare CDN

---

##  Developer

**Sayan Goswami**
System Architect, Backend Developer


---

##  Academic Note

LokVeda was developed as an academic project demonstrating secure authentication, role-based access control, workflow management, session security, and digital governance concepts in a Panchayat-level service delivery system.
