import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock authentication - In real app, verify against database
    // For testing, we'll use simple email patterns to determine roles
    let userRole: 'Patient' | 'Doctor' = 'Patient';
    let userId = 'patient_123';
    let firstName = 'Test';
    let lastName = 'Patient';

    if (email.includes('doctor') || email.startsWith('dr.')) {
      userRole = 'Doctor';
      userId = 'doctor_123';
      firstName = 'Dr. Test';
      lastName = 'Doctor';
    }

    // Mock some sample users for testing
    const mockUsers = [
      {
        email: 'patient@test.com',
        password: 'password123',
        userRole: 'Patient' as const,
        userId: 'patient_001',
        firstName: 'John',
        lastName: 'Doe'
      },
      {
        email: 'doctor@test.com',
        password: 'password123',
        userRole: 'Doctor' as const,
        userId: 'doctor_001',
        firstName: 'Dr. Jane',
        lastName: 'Smith'
      },
      {
        email: 'dr.smith@hospital.com',
        password: 'doctor123',
        userRole: 'Doctor' as const,
        userId: 'doctor_002',
        firstName: 'Dr. Michael',
        lastName: 'Smith'
      }
    ];

    // Check if user exists in mock database
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      userRole = user.userRole;
      userId = user.userId;
      firstName = user.firstName;
      lastName = user.lastName;
    } else {
      // For any other email/password combination, allow login but determine role by email pattern
      if (password !== 'password123' && password !== 'doctor123') {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    }

    // Generate token (in real app, use JWT)
    const token = `auth_token_${userId}_${Date.now()}`;
    const tokenExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    return NextResponse.json({
      token,
      tokenExpiryDate,
      userRole,
      userId,
      firstName,
      lastName,
      message: 'Signin successful'
    });

  } catch (error) {
    console.error('Signin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}