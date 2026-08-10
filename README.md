# LokVeda — Digital E-Gram Panchayat System

LokVeda is a full-stack E-Gram Panchayat project developed to make common Panchayat services available through a simple web application.

The main idea of LokVeda is to provide a digital platform where citizens can apply for different government services, track their applications, and correct and resubmit rejected applications. Staff members can review applications, while administrators can manage services and approve applications.

---

## Project Overview

LokVeda works like a basic online Panchayat service portal.

Citizens can:

* Apply for government services
* Check application status
* Correct and resubmit rejected applications
* View their profile
* See services available in their area

Staff members can review applications and forward valid applications to administrators.

Administrators can manage services, approve applications, and monitor applications for their Panchayat area.

---

## User Roles

### Citizen

* Login using Aadhaar number and OTP
* Apply for available services
* Check application status
* Resubmit rejected applications
* View profile information

### Staff

* View and review citizen applications
* Reject incomplete applications
* Forward valid applications to administrators
* Check previously rejected applications

### Administrator

* Activate or deactivate services
* Approve applications reviewed by staff
* View rejected applications
* View approved applications
* Manage services according to Panchayat areas

---

## Main Features

### Login and Authentication

LokVeda uses several security features for login:

* Aadhaar-based login
* Email OTP verification
* Random OTP generation using crypto
* bcrypt for storing OTP securely
* JWT authentication
* Session token management
* One active session for an account

### Location Verification

Before generating an OTP, the system checks the user's location.

* **Citizens:** Allowed within their registered state
* **Staff:** Must be within 10 km of their assigned area
* **Administrators:** Must be within 250 km of their assigned area

The distance is also shown to the user through simple messages.

### Security Features

The project includes:

* Maximum login attempt limit
* Suspicious login detection
* Session checking
* Device tracking
* IP logging
* Location tracking
* Account locking

### Session Management

* Authentication token during login
* Session token after OTP verification
* Automatic session expiry
* Logout handling
* Prevention of multiple active sessions

### Dark Mode

The website also supports dark mode.

* Detects the browser's preferred theme
* Saves the user's theme preference
* Works throughout the application
* Includes smooth theme changes

### Greeting System

The dashboard shows different greetings depending on:

* User's name
* Current time
* Sunrise and sunset time

---

## Application Workflow

### Citizen Application

```text
Application Submitted
        ↓
Pending Review
        ↓
Reviewed by Staff
        ↓
Approved by Admin
```

### Rejection and Resubmission

```text
Application Submitted
        ↓
Rejected
        ↓
Citizen Corrects Application
        ↓
Application Resubmitted
        ↓
Review Process Continues
```

---

## Service Management

Administrators can turn individual services on or off for different Panchayat areas.

Citizens can only see services that are currently active in their area.

Services that already have pending, reviewed, or approved applications are not shown again on the application page.

Rejected applications that can be corrected and resubmitted are also shown to the citizen.

---

## Available Services

The project includes services such as:

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

LokVeda currently has forms for 22 different government services:

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

## Basic Architecture

The project follows a simple flow:

```text
User Browser
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
MongoDB
```

### Security Flow

The main security checks are:

1. Aadhaar validation
2. Location checking
3. OTP verification
4. JWT authentication
5. Session validation
6. Role checking
7. Service access checking
8. Account lock protection

---

## Main Modules

### Authentication

* Aadhaar verification
* Email OTP verification
* JWT authentication
* Device/session tracking
* Suspicious login detection

### Service Module

* Service forms
* Application submission
* Application review
* Application approval
* Application rejection

### Administration

* Activate services
* Deactivate services
* Manage services according to area
* Approve applications

### Dashboards

Different dashboards are available for:

* Citizens
* Staff
* Administrators

### UI

The interface includes:

* Dark mode
* Responsive design
* Dynamic navigation
* Simple status messages
* Area-based service display
* Area-aware footer

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

### Email

* Nodemailer

### Deployment

* **Render** — Used to host and run the Node.js/Express application.
* **Cloudflare** — Planned for future use for DNS, caching, CDN, SSL improvements, and basic traffic/bot protection.

---

## Project Structure

LokVeda follows the MVC (Model-View-Controller) pattern.

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

## User Experience

Some features added to make the website easier to use are:

* Simple status messages
* Responsive pages
* Services based on user's area
* Automatic filling of rejected applications
* Consistent navigation
* Simple and clean interface
* Easy-to-understand workflow for users who may not be very familiar with technology

---

## Current Limitations

Some features are not implemented yet:

* File uploads
* PDF generation
* Document downloads
* Search functionality
* Notifications
* Analytics dashboard

---

## Future Improvements

Some features planned for future versions are:

* File upload support
* PDF generation
* Digital document downloads
* SMS notifications
* Analytics and reports
* Search and filtering
* Multiple language support
* Mobile application
* User-uploaded profile pictures
* Cloud storage for profile images
* Custom domain using Cloudflare
* Cloudflare bot protection and traffic filtering
* CDN support for faster content delivery

Currently, profile pictures use sample avatars stored locally in the project.

---

## Developer

**Sayan Goswami**
System Architect & Backend Developer

---

## Academic Project

LokVeda was developed as an academic project to understand and implement concepts such as authentication, role-based access, application workflows, session management, security, and digital governance.

The project is mainly focused on creating a simple example of how Panchayat-level services can be moved from a traditional process to an online platform.
