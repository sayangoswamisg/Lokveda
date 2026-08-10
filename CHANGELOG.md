# 🕒 Changelog

All notable changes to this project will be documented in this file.

The format is inspired by Keep a Changelog and follows [Semantic Versioning (SemVer)](https://semver.org/) standards.

---

# [2.0.0] - 2026-06-16

## Added

### Authentication & Security

* Replaced simulated OTP authentication with real OTP verification
* Added crypto-generated OTP generation
* Added OTP delivery through email
* Added bcrypt-based OTP hashing
* Added JWT authentication tokens
* Added secure session tokens
* Added single-session-per-user enforcement
* Added login attempt tracking
* Added suspicious login detection
* Added account lock mechanisms
* Added IP address tracking
* Added login device tracking
* Added location tracking for authentication events
* Render — Application hosting and deployment platform
* Cloudflare (Planned)

### Location Verification

* Added geographic access validation before OTP generation
* Added state-level validation for citizens
* Added 10 km validation radius for staff members
* Added 250 km validation radius for administrators
* Added distance calculation and reporting
* Added support for all Indian states through imported coordinate data

### User Experience

* Added global dark mode system
* Added persistent theme preference storage
* Added greeting system integration across dashboards
* Added improved status messages throughout the application
* Added loading state protections
* Added navigation improvements across all pages
* Added contextual Panchayat information in footer
* Added Google Maps integration for Panchayat locations
* Added feedback and contact links

### Citizen Features

* Added service application system
* Added application status tracking
* Added rejected application re-submission workflow
* Added auto-filled rejected forms
* Added service availability filtering
* Added profile management view

### Staff Features

* Added application review workflow
* Added pending application management
* Added rejected application review
* Added profile inspection workflow
* Added application inspection workflow

### Administrator Features

* Added service activation controls
* Added service deactivation controls
* Added reviewed application approval workflow
* Added rejected application review workflow
* Added approved application tracking
* Added area-wise service management

### Workflow System

* Added Pending state
* Added Reviewed state
* Added Approved state
* Added Rejected state
* Added reviewer tracking
* Added approver tracking
* Added rejection tracking
* Added review timestamps
* Added approval timestamps
* Added rejection timestamps

### Backend

* Added Express backend architecture
* Added MongoDB integration
* Added Mongoose models
* Added MVC architecture
* Added authentication middleware
* Added route protection
* Added role-based authorization
* Added service controller system
* Added dashboard controller system
* Added authentication controller system

---

## Changed

### Architecture

* Migrated from frontend-only prototype to full-stack architecture
* Replaced Firebase-based simulation with MongoDB backend
* Replaced static workflow simulation with persistent database operations
* Replaced prototype dashboards with role-aware workflows

### Services

* Reworked service lifecycle management
* Introduced area-based service activation
* Improved service visibility filtering
* Improved application navigation

### User Interface

* Redesigned dashboard workflows
* Improved navigation consistency
* Improved service management pages
* Improved profile pages
* Improved application review pages
* Improved status tracking interface

---

## Fixed

* Fixed duplicate service visibility issues
* Fixed approved applications appearing in review queues
* Fixed rejected application workflow inconsistencies
* Fixed route navigation issues
* Fixed dashboard navigation bugs
* Fixed session validation issues
* Fixed application state transition issues
* Fixed form auto-fill issues
* Fixed date rendering issues
* Fixed multiple UI consistency problems

---

# [1.0.1] - 2025-12-21

## Added

* Firebase-based authentication simulation
* Session validation prototype
* Role-based dashboards
* Location verification prototype
* Dark mode support
* Greeting bot
* Dynamic navigation bar
* Service previews
* Form loading system

## Notes

This release served as the foundation and proof-of-concept version of LokVeda.

Most service operations were simulated and backend functionality was intentionally limited.

---

# [1.0.0] - Initial Release

## Added

* Initial project architecture
* Dashboard system
* Authentication prototype
* Form preview system
* Service catalog
* Documentation
* Basic security controls
