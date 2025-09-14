const mongoose = require('mongoose');
const { Chat, Appointment } = require('./models');

const addChatMessage = async (appointmentId, senderId, receiverId, message) => {
    try {
        // Find existing chat for this appointment
        let chat = await Chat.findOne({ appointmentId: appointmentId });
        
        if (!chat) {
            // Create new chat if it doesn't exist
            chat = new Chat({
                participants: [senderId, receiverId],
                appointmentId: appointmentId,
                messages: [],
                lastMessage: message,
                lastMessageTime: new Date()
            });
        }
        
        // Add the new message
        const newMessage = {
            senderId: senderId,
            message: message,
            messageType: 'text',
            timestamp: new Date(),
            isRead: false
        };
        
        chat.messages.push(newMessage);
        chat.lastMessage = message;
        chat.lastMessageTime = new Date();
        
        const savedChat = await chat.save();
        
        // Return the newly added message (last message in array)
        return savedChat.messages[savedChat.messages.length - 1];
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
};

const getChatMessages = async (appointmentId) => {
    try {
        const chat = await Chat.findOne({ appointmentId: appointmentId })
            .populate('participants', 'firstName lastName email');
        
        if (!chat || !chat.messages.length) {
            return [];
        }
        
        // Convert to format similar to original
        const messages = chat.messages.map(msg => ({
            message_sender_id: msg.senderId,
            message_receiver_id: chat.participants.find(p => p._id.toString() !== msg.senderId.toString())?._id,
            message_content: msg.message,
            message_appointment_id: appointmentId,
            message_date: msg.timestamp,
            message_type: msg.messageType,
            is_read: msg.isRead
        }));
        
        return messages;
    } catch (error) {
        console.error('Error retrieving chat messages:', error);
        return false;
    }
};

const getAppointmentDoctorandPatient = async (appointmentId) => {
    try {
        const appointment = await Appointment.findById(appointmentId)
            .select('patientId doctorId');
        
        if (!appointment) {
            return false;
        }
        
        return {
            appointment_doctor_id: appointment.doctorId,
            appointment_patient_id: appointment.patientId
        };
    } catch (error) {
        console.error('Error retrieving appointment doctor and patient:', error);
        return false;
    }
};

module.exports = { addChatMessage, getChatMessages, getAppointmentDoctorandPatient };