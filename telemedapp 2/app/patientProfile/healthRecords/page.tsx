import React from 'react';
import DigitalHealthRecords from '../../../components/patientProfile/DigitalHealthRecords';
import RoleProtected from '../../../components/common/RoleProtected';

const HealthRecordsPage = () => {
  return (
    <RoleProtected requiredRole="Patient">
      <DigitalHealthRecords />
    </RoleProtected>
  );
};

export default HealthRecordsPage;