const bcrypt = require('bcryptjs');
const database = require('../Database/Login');
const { createToken } = require('../Utilities');
const { ACCESS_TOKEN_EXPIRATION_IN_MILLISECONDS } = process.env;

const login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    let message = '';

    if (!email || !password) {
        message = 'Please fill all the fields';
        return res.status(404).json({ message });
    }

    // Retrieve user from MongoDB
    const userArr = await database.retrieveUser(email);
    if (!userArr) {
        message = 'Invalid email';
        return res.status(400).json({ message });
    }

    const user = userArr[0];
    console.log('User retrieved:', user);

    // Compare password with Mongo field passwordHash
    const match = await bcrypt.compare(password, user.passwordHash);
    console.log('Password match result:', match);
    if (!match) {
        message = 'Invalid email or password';
        return res.status(400).json({ message });
    }

    // Check account state based on role
    const userAccountState = await database.retrieveUserState(user._id, user.role);
    console.log('User account state:', userAccountState);

    // Auto-approve doctors who are in pending state
    if (user.role === 'Doctor' && userAccountState === 'Pending') {
        console.log('Auto-approving doctor account:', user.email);
        // Update the doctor's state to Approved
        await database.updateDoctorState(user._id, 'Approved');
        console.log('Doctor account auto-approved:', user.email);
    }

    // Check final account state after potential auto-approval
    const finalAccountState = user.role === 'Doctor' && userAccountState === 'Pending' 
        ? 'Approved' 
        : userAccountState;

    // Enforce account state rules
    if (user.role === 'Doctor') {
        if (finalAccountState === 'Suspended' || finalAccountState === 'Rejected') {
            return res.status(403).json({ message: 'Account has been banned' });
        }
        // Pending state should now be handled by auto-approval above
        if (finalAccountState === 'Pending') {
            return res.status(403).json({ message: 'Account activation failed. Please contact support.' });
        }
    }

    // Count unread notifications
    const unreadCount = await database.getUnreadNotificationCount(user._id);

    // Create JWT token using Mongo field names
    const token = createToken(user._id, user.email, user.role, user.firstName, user.lastName);
    if (!token) {
        message = 'Token could not be created';
        return res.status(400).json({ message });
    }

    return res.json({ message: 'Login successful', token, Notifications: unreadCount });
};

module.exports = { login };