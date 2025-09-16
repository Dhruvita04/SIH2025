const mongoose = require('mongoose');
const { User, Doctor } = require('../models');
require('dotenv').config();

const checkUserEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log('User already exists', user);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking user email:', error);
    return false;
  }
};

const insertDoctor = async (userData) => {
  let session = null;
  let useTxn = false;
  
  try {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTxn = true;
    } catch (e) {
      console.warn('Transactions not available, proceeding without them:', e.message);
    }
    
    // Create user first
    const user = new User({
      firstName: userData.fName,
      lastName: userData.lName,
      email: userData.email.toLowerCase(),
      phoneNumber: userData.phone,
      gender: userData.gender,
      role: userData.role,
      passwordHash: userData.password,
      birthDate: userData.birthDate
    });
    
  const savedUser = useTxn && session ? await user.save({ session }) : await user.save();
    
    if (!savedUser) {
      console.log('User not added');
      await session.abortTransaction();
      return false;
    }
    
    // Create doctor profile
    const doctor = new Doctor({
      userId: savedUser._id,
      specialization: userData.speciality || 'General Medicine',
      qualification: userData.qualification || 'MBBS',
      experience: userData.experience || 1,
      licenseNumber: userData.licenseNumber || `LIC-${Date.now()}-${savedUser._id.toString().slice(-6)}`,
      consultationFee: userData.consultationFee || 500,
      accountState: userData.state || 'Pending',
      bio: userData.bio || '',
      country: userData.country || '',
      city: userData.city || '',
      location: userData.location || '',
      certificates: Array.isArray(userData.certificates) ? userData.certificates.map(c => ({
        name: c.name || '',
        authority: c.authority || '',
        startDate: c.startDate ? new Date(c.startDate) : undefined,
        endDate: c.endDate ? new Date(c.endDate) : undefined,
      })) : [],
      experiences: Array.isArray(userData.experiences) ? userData.experiences.map(ex => ({
        title: ex.title || '',
        firm: ex.firm || '',
        department: ex.department || '',
        startDate: ex.startDate ? new Date(ex.startDate) : undefined,
        endDate: ex.endDate ? new Date(ex.endDate) : undefined,
      })) : [],
      interests: Array.isArray(userData.interests) ? userData.interests.map(i => ({
        name: i.name || '',
        category: i.category || '',
      })) : [],
      languages: Array.isArray(userData.languages) ? userData.languages : []
    });
    
    const savedDoctor = useTxn && session ? await doctor.save({ session }) : await doctor.save();
    
    if (!savedDoctor) {
      console.log('Doctor not added');
      await session.abortTransaction();
      return false;
    }
    
  if (useTxn && session) await session.commitTransaction();
    
    // Return combined user and doctor info
    const populatedDoctor = await Doctor.findById(savedDoctor._id)
      .populate('userId')
      .session(null);
    
    if (populatedDoctor) {
      console.log('User and doctor info retrieved successfully', populatedDoctor);
      return {
        doctor_id: populatedDoctor._id,
        user_id: populatedDoctor.userId._id,
        user_first_name: populatedDoctor.userId.firstName,
        user_last_name: populatedDoctor.userId.lastName,
        user_email: populatedDoctor.userId.email,
        user_phone_number: populatedDoctor.userId.phoneNumber,
        user_gender: populatedDoctor.userId.gender,
        user_role: populatedDoctor.userId.role,
        user_birth_date: populatedDoctor.userId.birthDate,
        doctor_user_id_reference: populatedDoctor.userId._id,
        doctor_specialization: populatedDoctor.specialization,
        doctor_account_state: populatedDoctor.accountState
      };
    }
    
    console.log('Combined user and doctor info not found');
    return false;
    
  } catch (error) {
    if (useTxn && session && session.inTransaction()) {
      try { await session.abortTransaction(); } catch (_) {}
    }
    console.error('Error inserting doctor:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    return false;
  } finally {
    if (session) session.endSession();
  }
};

// Note: The following functions are currently not implemented in the new schema
// but can be added if needed by extending the Doctor model

const saveDoctorcertificates = async (certificates, doctorId) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('Doctor not found');
      return false;
    }
    
    if (Array.isArray(certificates)) {
      doctor.certificates = certificates.map(cert => {
        const certificate = {
          name: cert.name || '',
          authority: cert.authority || ''
        };
        
        // Only add startDate if it's a valid date
        if (cert.startDate && cert.startDate.trim() !== '') {
          const startDate = new Date(cert.startDate);
          if (!isNaN(startDate.getTime())) {
            certificate.startDate = startDate;
          }
        }
        
        // Only add endDate if it's a valid date
        if (cert.endDate && cert.endDate.trim() !== '') {
          const endDate = new Date(cert.endDate);
          if (!isNaN(endDate.getTime())) {
            certificate.endDate = endDate;
          }
        }
        
        return certificate;
      });
      await doctor.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error inserting Certificates:', error);
    return false;
  }
};

const saveDoctorexperiences = async (experiences, doctorId) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('Doctor not found');
      return false;
    }
    
    if (Array.isArray(experiences)) {
      doctor.experiences = experiences.map(exp => {
        const experience = {
          title: exp.title || '',
          firm: exp.firm || '',
          department: exp.department || ''
        };
        
        // Only add startDate if it's a valid date
        if (exp.startDate && exp.startDate.trim() !== '') {
          const startDate = new Date(exp.startDate);
          if (!isNaN(startDate.getTime())) {
            experience.startDate = startDate;
          }
        }
        
        // Only add endDate if it's a valid date
        if (exp.endDate && exp.endDate.trim() !== '') {
          const endDate = new Date(exp.endDate);
          if (!isNaN(endDate.getTime())) {
            experience.endDate = endDate;
          }
        }
        
        return experience;
      });
      await doctor.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error inserting Experiences:', error);
    return false;
  }
};

const saveDoctorinterests = async (interests, doctorId) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('Doctor not found');
      return false;
    }
    if (Array.isArray(interests)) {
      doctor.interests = interests.map(i => ({ name: i.name || '', category: i.category || '' }));
      await doctor.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error inserting Interests:', error);
    return false;
  }
};

const saveDoctorlanguage = async (languages, doctorId) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('Doctor not found');
      return false;
    }
    if (Array.isArray(languages)) {
      doctor.languages = languages.map(l => String(l));
      await doctor.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error inserting Language:', error);
    return false;
  }
};

module.exports = {
  checkUserEmail,
  insertDoctor,
  saveDoctorcertificates,
  saveDoctorexperiences,
  saveDoctorinterests,
  saveDoctorlanguage,
};
