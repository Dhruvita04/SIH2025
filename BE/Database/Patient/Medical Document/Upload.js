const mongoose = require('mongoose');
const { MedicalDocument, Patient } = require('../../models');
require('dotenv').config();

const insertFile = async (patientId, fileName, fileType, fileData) => {
    try {
        // Get patient details
        const patient = await Patient.findOne({ userId: patientId });
        if (!patient) {
            console.log('Patient not found');
            return false;
        }

        // Create new medical document
        const medicalDoc = new MedicalDocument({
            patientId: patient._id,
            documentType: fileType,
            title: fileName,
            description: `Uploaded medical document: ${fileName}`,
            fileUrl: fileData, // This should be a URL or file path
            fileName: fileName,
            fileSize: Buffer.byteLength(fileData || '', 'utf8'), // Approximate size
            mimeType: getMimeType(fileType),
            uploadDate: new Date(),
            isActive: true
        });

        const savedDoc = await medicalDoc.save();

        if (!savedDoc) {
            console.log('Could not insert file');
            return false;
        }

        console.log('File inserted:', savedDoc);
        
        // Return in format similar to original
        return [{
            medical_documents_id: savedDoc._id,
            medical_documents_patient_id: patientId,
            medical_document_name: savedDoc.fileName,
            medical_document_type: savedDoc.documentType,
            medical_document_data: savedDoc.fileUrl,
            upload_date: savedDoc.uploadDate
        }];
    } catch (error) {
        console.error('Error inserting file:', error);
        return null;
    }
};

// Helper function to determine MIME type
const getMimeType = (fileType) => {
    const mimeTypes = {
        'Lab Report': 'application/pdf',
        'X-Ray': 'image/jpeg',
        'MRI': 'image/dicom',
        'CT Scan': 'image/dicom',
        'Prescription': 'application/pdf',
        'Medical Certificate': 'application/pdf',
        'Other': 'application/octet-stream'
    };
    return mimeTypes[fileType] || 'application/octet-stream';
};

module.exports = { insertFile };