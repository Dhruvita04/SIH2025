const { MedicalDocument } = require('../../models/MedicalDocument');

const deleteFile = async (patientId, fileId) => {
    try {
        const deletedFile = await MedicalDocument.findOneAndDelete({ 
            _id: fileId, 
            patientId: patientId 
        });
        if (deletedFile) {
            console.log('File deleted:', deletedFile);
            return [{ medical_document_id: deletedFile._id }];
        }
        console.log('No file found');
        return false;
    } catch (error) {
        console.error('Error deleting file:', error.stack);
        return false;
    }
};

module.exports = { deleteFile };