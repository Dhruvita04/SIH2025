const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('Connection string:', process.env.MONGODB_URI ? 'Found' : 'Missing');
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: process.env.MONGODB_DBNAME || undefined,
        });
        
        console.log('✅ MongoDB Connected Successfully!');
        console.log('Host:', conn.connection.host);
        console.log('Database:', conn.connection.name);
        
        // Test creating a simple document
        const testSchema = new mongoose.Schema({ test: String });
        const TestModel = mongoose.model('Test', testSchema);
        
        const testDoc = new TestModel({ test: 'Connection test successful' });
        await testDoc.save();
        console.log('✅ Test document created successfully');
        
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('✅ Test document deleted successfully');
        
        await mongoose.connection.close();
        console.log('✅ Connection closed successfully');
        
    } catch (error) {
        console.error('❌ MongoDB Connection Error:');
        console.error('Error message:', error.message);
        
        if (error.message.includes('ENOTFOUND')) {
            console.error('💡 This usually means:');
            console.error('   1. Invalid cluster URL in connection string');
            console.error('   2. Network connectivity issues');
        } else if (error.message.includes('Authentication failed')) {
            console.error('💡 This usually means:');
            console.error('   1. Wrong username or password');
            console.error('   2. User not created in MongoDB Atlas');
        } else if (error.message.includes('not authorized')) {
            console.error('💡 This usually means:');
            console.error('   1. IP address not whitelisted');
            console.error('   2. User doesn\'t have proper permissions');
        }
        
        process.exit(1);
    }
};

testConnection();
