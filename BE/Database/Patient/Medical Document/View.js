const { MedicalDocument } = require('../../models/MedicalDocument');

const retrieveFiles = async (patientId) => {
    try {
        const files = await MedicalDocument.find({ patientId }).sort({ createdAt: -1 });
        if (files.length > 0) {
            console.log('Files retrieved:', files);
            return files;
        }
        console.log('No files found');
        return false;
    } catch (error) {
        console.error('Error retrieving files:', error.stack);
        return false;
    }
};

module.exports = { retrieveFiles };