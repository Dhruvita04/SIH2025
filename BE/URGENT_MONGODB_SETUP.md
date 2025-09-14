# URGENT: MongoDB Atlas Setup Guide

## YOU MUST DO THIS TO MAKE YOUR DATABASE WORK!

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email
3. Choose "Shared" (FREE) cluster

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "M0 Sandbox" (FREE)
3. Choose AWS provider
4. Choose a region close to you
5. Cluster name: any name (e.g., "TelemedCluster")
6. Click "Create"

### Step 3: Create Database User
1. Click "Database Access" in left menu
2. Click "Add New Database User"
3. Username: telemed_databaes_owner
4. Password: 8lo2xPrbJHBt
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

### Step 4: Add IP Address
1. Click "Network Access" in left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go back to "Database" (left menu)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js, Version: 5.5 or later
5. Copy the connection string
6. It will look like: mongodb+srv://telemed_databaes_owner:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

### Step 6: Update Your .env File
Replace the MONGODB_URI in your .env file with the REAL connection string:

MONGODB_URI=mongodb+srv://telemed_databaes_owner:8lo2xPrbJHBt@cluster0.xxxxx.mongodb.net/telemed_databaes?retryWrites=true&w=majority

(Replace cluster0.xxxxx with your actual cluster URL)

### Step 7: Test Again
Run: node test-mongodb.js

## Why This Failed:
I created a placeholder connection string with a fake cluster URL. MongoDB Atlas gives you a UNIQUE cluster URL when you create an account and cluster. Without actually setting up Atlas, the database can't connect.

## What Happens After Setup:
- Your app will connect to MongoDB Atlas (cloud database)
- All your user data, appointments, chats will be stored in MongoDB
- Much faster and more scalable than PostgreSQL
- Real-time features will work better
