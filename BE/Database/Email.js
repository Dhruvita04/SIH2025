const { User } = require('./models/User');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (user) {
            console.log('User already exists', user);
            return user;
        }
        console.log('User not found');
        return false;
    } catch (error) {
        console.error(error.stack);
        return false;
    }
};

const updatePassword = async (id, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const updatedUser = await User.findOneAndUpdate(
            { _id: id, email }, 
            { passwordHash: hashedPassword },
            { new: true }
        );
        if (updatedUser) {
            console.log('Password updated', updatedUser);
            return true;
        }
        console.log('Password not updated');
        return false;
    } catch (error) {
        console.error(error.stack);
        return false;
    }
};

module.exports = { getUserByEmail, updatePassword };


