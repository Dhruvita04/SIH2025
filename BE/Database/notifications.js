const mongoose = require('mongoose');
const { Notification, User } = require('./models');
require('dotenv').config();

const getUnreadNotifications = async (userId) => {
    try {
        const notifications = await Notification.find({ 
            userId: userId, 
            isRead: false 
        }).sort({ createdAt: -1 });
        
        // Convert to format similar to original
        return notifications.map(notif => ({
            notification_id: notif._id,
            user_id: notif.userId,
            title: notif.title,
            message: notif.message,
            notification_type: notif.type,
            read: notif.isRead,
            created_at: notif.createdAt,
            priority: notif.priority,
            data: notif.data
        }));
    } catch (error) {
        console.error('Error getting unread notifications:', error);
        throw error;
    }
};

const getNotifications = async (userId) => {
    try {
        const notifications = await Notification.find({ 
            userId: userId 
        }).sort({ createdAt: -1 });
        
        // Convert to format similar to original
        return notifications.map(notif => ({
            notification_id: notif._id,
            user_id: notif.userId,
            title: notif.title,
            message: notif.message,
            notification_type: notif.type,
            read: notif.isRead,
            created_at: notif.createdAt,
            read_at: notif.readAt,
            priority: notif.priority,
            data: notif.data
        }));
    } catch (error) {
        console.error('Error getting notifications:', error);
        throw error;
    }
};

const markNotificationsAsRead = async (notificationIds) => {
    try {
        await Notification.updateMany(
            { _id: { $in: notificationIds } },
            { 
                isRead: true, 
                readAt: new Date() 
            }
        );
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        throw error;
    }
};

const addNotification = async (notification) => {
    try {
        const newNotification = new Notification({
            userId: notification.recipientId,
            type: notification.notificationType,
            title: notification.title,
            message: notification.message,
            data: notification.data || {},
            priority: notification.priority || 'Medium'
        });
        
        await newNotification.save();
    } catch (error) {
        console.error('Error adding notification:', error);
        throw error;
    }
};

// For push tokens, we'll add this to the User model or create a separate collection
const setExpoPushToken = async (userId, expoPushToken) => {
    try {
        // For now, we'll store it in the user document
        // You might want to create a separate PushToken model
        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { pushTokens: expoPushToken } },
            { upsert: true }
        );
    } catch (error) {
        console.error('Error setting expo push token:', error);
        throw error;
    }
};

const fetchExpotoken = async (userid) => {
    try {
        const user = await User.findById(userid).select('pushTokens');
        if (user && user.pushTokens && user.pushTokens.length > 0) {
            return user.pushTokens[0]; // Return the first token
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching expo token:', error);
        throw error;
    }
};

module.exports = { 
    setExpoPushToken, 
    getUnreadNotifications, 
    getNotifications, 
    markNotificationsAsRead, 
    addNotification, 
    fetchExpotoken 
};