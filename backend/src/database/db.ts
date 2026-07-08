import mongoose from 'mongoose';
import { env } from '../config/env';
import { MongoMemoryServer } from 'mongodb-memory-server';

import Department from '../models/Department';
import Designation from '../models/Designation';
import OfficeLocation from '../models/OfficeLocation';
import WorkShift from '../models/WorkShift';
import Employee from '../models/Employee';
import Candidate from '../models/Candidate';

let mongod: MongoMemoryServer | null = null;

const seedDatabase = async () => {
  const orgId = new mongoose.Types.ObjectId('603d2e1b12cf000000000001');

  // 1. Seed Shifts
  const shiftCount = await WorkShift.countDocuments();
  let shiftId;
  if (shiftCount === 0) {
    const shift = await WorkShift.create({
      orgId,
      name: 'General Shift',
      startTime: '09:00',
      endTime: '18:00',
      gracePeriodMins: 15,
    });
    shiftId = shift._id;
    console.log('🌱 Seeded default shift');
  } else {
    const s = await WorkShift.findOne();
    shiftId = s?._id;
  }

  // 2. Seed Locations
  const locationCount = await OfficeLocation.countDocuments();
  let locationId;
  if (locationCount === 0) {
    const loc = await OfficeLocation.create({
      orgId,
      name: 'Headquarters (Bangalore)',
      timezone: 'Asia/Kolkata',
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
    });
    locationId = loc._id;
    console.log('🌱 Seeded default location');
  } else {
    const l = await OfficeLocation.findOne();
    locationId = l?._id;
  }

  // 3. Seed Departments
  const deptCount = await Department.countDocuments();
  let deptId;
  if (deptCount === 0) {
    const dept = await Department.create({
      orgId,
      name: 'Engineering',
      code: 'ENG',
    });
    deptId = dept._id;
    console.log('🌱 Seeded default department');
  } else {
    const d = await Department.findOne();
    deptId = d?._id;
  }

  // 4. Seed Designations
  const desgCount = await Designation.countDocuments();
  if (desgCount === 0 && deptId) {
    await Designation.create({
      orgId,
      deptId,
      title: 'Software Engineer',
      grade: 'E3',
    });
    console.log('🌱 Seeded default designation');
  }

  // 5. Seed default reporting manager
  const employeeCount = await Employee.countDocuments();
  if (employeeCount === 0) {
    await Employee.create({
      orgId,
      employeeId: 'EMP0001',
      name: 'Sonal Admin',
      firstName: 'Sonal',
      lastName: 'Admin',
      email: 'admin@workforce.com',
      phone: '+919999988888',
      gender: 'Female',
      dob: new Date('1990-01-01'),
      joiningDate: new Date(),
      deptId,
      locationId,
      shiftId,
      role: 'OrgAdmin',
      status: 'Active',
      passwordHash: '$2a$10$7zBvB02w.5.8L3Y6L3uJ2.r8E/uNqA64q1k8.tGj8.7j9.8j9.8j9', // default password: "password"
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Spouse',
        phone: '+919999988888',
      },
      timeline: [
        {
          action: 'System Seeded',
          description: 'Seed Manager Account initialized',
          performedBy: 'System',
        },
      ],
    });
    console.log('🌱 Seeded default administrator manager');
  }

  // 6. Seed mock candidate for recruitment workflow
  const candidateCount = await Candidate.countDocuments();
  if (candidateCount === 0) {
    await Candidate.create({
      orgId,
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+919876543210',
      gender: 'Male',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      experienceYears: 4,
      source: 'LinkedIn Referral',
      status: 'Applied',
      timeline: [
        {
          stage: 'Applied',
          note: 'Application registered from LinkedIn pipeline.',
        }
      ]
    });
    console.log('🌱 Seeded default candidate for recruitment board');
  }
};

export const connectDatabase = async (): Promise<void> => {
  try {
    let uri = env.MONGODB_URI;

    if (env.NODE_ENV === 'development' && (uri.includes('localhost') || uri.includes('127.0.0.1') || uri.includes('::1'))) {
      console.log('🔄 Starting MongoMemoryServer for zero-dependency development...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`ℹ️ MongoMemoryServer started with URI: ${uri}`);
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed master and metadata defaults
    await seedDatabase();
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      console.log('✅ MongoMemoryServer stopped');
    }
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error(`❌ Error disconnecting MongoDB: ${(error as Error).message}`);
  }
};
