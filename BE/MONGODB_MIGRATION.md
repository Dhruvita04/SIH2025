# MongoDB Atlas Migration Guide

## Overview
This project has been migrated from PostgreSQL to MongoDB Atlas. This document outlines the changes made and steps to complete the migration.

## Changes Made

### 1. Dependencies Updated
- Removed: `pg` (PostgreSQL driver)
- Added: `mongoose` (MongoDB ODM)

### 2. Database Connection
- New connection file: `Database/config/mongoConnection.js`
- Uses MongoDB Atlas connection string
- Includes proper error handling and graceful shutdown

### 3. Database Models
All PostgreSQL tables have been converted to MongoDB collections with Mongoose schemas:

- **User** (`Database/models/User.js`)
- **Doctor** (`Database/models/Doctor.js`)
- **Patient** (`Database/models/Patient.js`)
- **Appointment** (`Database/models/Appointment.js`)
- **MedicalDocument** (`Database/models/MedicalDocument.js`)
- **Notification** (`Database/models/Notification.js`)
- **Chat** (`Database/models/Chat.js`)

### 4. Database Operations Updated
The following files have been updated to use MongoDB:

- `Database/Login.js`
- `Database/Doctor/Register.js`
- `Database/Patient/Register.js`
- `Database/Chat.js`
- `Database/notifications.js`

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up MongoDB Atlas
1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Whitelist your IP address

### 3. Environment Configuration
1. Copy `.env.example` to `.env`
2. Update the `MONGODB_URI` with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```
3. Remove old PostgreSQL environment variables:
   - PGHOST
   - PGDATABASE
   - PGUSER
   - PGPORT
   - PGPASSWORD

### 4. Data Migration (if needed)
If you have existing PostgreSQL data, you'll need to migrate it to MongoDB. Consider using:
- MongoDB Compass for manual data import
- Custom migration scripts
- Third-party migration tools

## Schema Mapping

### PostgreSQL → MongoDB
- **users** table → **User** collection
- **doctor** table → **Doctor** collection
- **patient** table → **Patient** collection
- **appointment** table → **Appointment** collection
- **message** table → **Chat** collection (with embedded messages)
- **notifications** table → **Notification** collection
- **medical_documents** → **MedicalDocument** collection

## Key Differences

### 1. IDs
- PostgreSQL: Numeric IDs (user_id, doctor_id, etc.)
- MongoDB: ObjectIds (_id)

### 2. Relationships
- PostgreSQL: Foreign keys with joins
- MongoDB: Document references with populate

### 3. Transactions
- PostgreSQL: BEGIN/COMMIT/ROLLBACK
- MongoDB: Sessions with transactions

### 4. Queries
- PostgreSQL: SQL queries
- MongoDB: Mongoose queries

## Additional Database Files to Update

The following database files may need updating based on your specific requirements:

### Doctor Files
- `Database/Doctor/Edit.js`
- `Database/Doctor/Profile.js`
- `Database/Doctor/appointmentdetails.js`
- `Database/Doctor/appointmentHistory.js`
- `Database/Doctor/AppointmentResponse.js`
- `Database/Doctor/AppointmentResults.js`
- `Database/Doctor/BookFollowUp.js`
- `Database/Doctor/Patientsummary.js`

### Patient Files
- `Database/Patient/Edit.js`
- `Database/Patient/Home.js`
- `Database/Patient/Profile.js`

### Other Files
- `Database/Email.js`
- `Database/backOffice/appointmentDetails.js`
- `Database/backOffice/backOfficeModel.js`

## Testing
1. Start the application: `npm start`
2. Test all endpoints to ensure proper functionality
3. Verify data operations (CRUD)
4. Test real-time features (chat, notifications)

## Troubleshooting

### Common Issues
1. **Connection Error**: Check MongoDB Atlas connection string and IP whitelist
2. **Schema Validation**: Ensure all required fields are provided
3. **ObjectId Conversion**: Update any hardcoded ID references

### Logs
Monitor application logs for MongoDB connection status and any errors.

## Performance Considerations
- Add appropriate indexes to frequently queried fields
- Use MongoDB aggregation pipeline for complex queries
- Consider data denormalization where appropriate

## Next Steps
1. Update remaining database files
2. Test all application features
3. Set up MongoDB indexes for optimization
4. Configure MongoDB Atlas monitoring and alerts
5. Set up regular backups
