export const debugLocalStorage = () => {
  if (typeof window === 'undefined') {
    console.log('Not in browser environment');
    return;
  }

  console.log('=== LocalStorage Debug ===');
  console.log('jwt:', localStorage.getItem('jwt'));
  console.log('userRole:', localStorage.getItem('userRole'));
  console.log('expiryDate:', localStorage.getItem('expiryDate'));
  console.log('userId:', localStorage.getItem('userId'));
  console.log('firstName:', localStorage.getItem('firstName'));
  console.log('lastName:', localStorage.getItem('lastName'));
  console.log('registeredUser:', localStorage.getItem('registeredUser'));
  console.log('========================');
};

export const setTestUser = (role: 'Patient' | 'Doctor') => {
  if (typeof window === 'undefined') return;

  // Clear existing data
  localStorage.clear();

  // Set test authentication data
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now

  localStorage.setItem('jwt', 'test-jwt-token-' + Date.now());
  localStorage.setItem('userRole', role);
  localStorage.setItem('expiryDate', expiryDate.toISOString());
  localStorage.setItem('userId', 'test-user-' + Date.now());
  localStorage.setItem('firstName', role === 'Doctor' ? 'Dr. Test' : 'Test');
  localStorage.setItem('lastName', 'User');

  if (role === 'Patient') {
    localStorage.setItem(
      'registeredUser',
      JSON.stringify({
        firstName: 'Test',
        lastName: 'Patient',
        email: 'patient@test.com',
        phone: '+1234567890',
        gender: 'Other',
        birthDate: '1990-01-01',
        id: 'test-patient-' + Date.now(),
      })
    );
  } else {
    localStorage.setItem(
      'registeredUser',
      JSON.stringify({
        firstName: 'Dr. Test',
        lastName: 'Doctor',
        email: 'doctor@test.com',
        phone: '+1234567890',
        gender: 'Other',
        birthDate: '1980-01-01',
        id: 'test-doctor-' + Date.now(),
        specialization: 'General Practice',
        experience: '10 years',
      })
    );
  }

  console.log(`Set test user as ${role}`);
  debugLocalStorage();
};