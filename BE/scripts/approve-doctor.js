// Usage: node scripts/approve-doctor.js <doctor-user-email>
// This script sets a doctor's accountState to 'Approved' by locating the user by email,
// then updating the corresponding Doctor document. Meant for local/dev unblocking.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { User, Doctor } = require('../Database/models');

const MONGODB_URI = process.env.MONGODB_URI;
const DBNAME = process.env.MONGODB_DBNAME || undefined;

async function main() {
  const email = (process.argv[2] || '').toLowerCase();
  if (!email) {
    console.error('Error: Please provide the doctor user email.');
    console.error('Example: node scripts/approve-doctor.js doctor@example.com');
    process.exit(1);
  }

  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not set in BE/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, { dbName: DBNAME });
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.error('No user found with that email');
      process.exit(1);
    }
    if (user.role !== 'Doctor') {
      console.error('User is not a Doctor');
      process.exit(1);
    }

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      console.error('Doctor document not found for this user');
      process.exit(1);
    }

    doctor.accountState = 'Approved';
    await doctor.save();

    console.log(`Success: Doctor for ${email} set to 'Approved'`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

main();
