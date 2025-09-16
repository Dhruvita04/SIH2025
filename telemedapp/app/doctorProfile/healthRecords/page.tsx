import React from 'react';
import DoctorHealthRecords from '../../../components/doctorProfile/DoctorHealthRecords';
import RoleProtected from '../../../components/common/RoleProtected';

const DoctorHealthRecordsPage = () => {
  return (
    <RoleProtected requiredRole="Doctor">
      <DoctorHealthRecords />
    </RoleProtected>
  );
};

export default DoctorHealthRecordsPage;