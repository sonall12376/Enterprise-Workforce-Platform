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
      geofenceRadius: 10000000, // 10,000 km geofence to support remote demo testing
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
      passwordHash: '$2a$10$oiQc3aHxbrksxPndNSWbHOv.Ijfq3PezD/x8J/ZUkj.GSNPghrHae', // default password: "password"
      baseSalary: 60000,
      allowances: 15000,
      deductions: 5000,
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
    await Candidate.create([
      {
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
            date: new Date(),
            updatedBy: 'System',
          }
        ]
      },
      {
        orgId,
        fullName: 'Bhavna Sen',
        email: 'bhavna.sen@example.com',
        phone: '+919876543215',
        gender: 'Female',
        skills: ['Kubernetes', 'Docker', 'AWS', 'Python'],
        experienceYears: 6,
        source: 'Direct Application',
        status: 'Technical Interview',
        timeline: [
          {
            stage: 'Applied',
            note: 'Direct resume upload.',
            date: new Date(Date.now() - 86400000 * 3),
            updatedBy: 'System',
          },
          {
            stage: 'Screening',
            note: 'Initial HR screening call passed.',
            date: new Date(Date.now() - 86400000 * 2),
            updatedBy: 'HR Manager',
          },
          {
            stage: 'Technical Interview',
            note: 'Scheduled for system design rounds.',
            date: new Date(Date.now() - 86400000),
            updatedBy: 'Tech Lead',
          }
        ]
      },
      {
        orgId,
        fullName: 'Chetan Mehta',
        email: 'chetan.mehta@example.com',
        phone: '+919876543220',
        gender: 'Male',
        skills: ['Figma', 'UI/UX Design', 'CSS3', 'Tailwind'],
        experienceYears: 3,
        source: 'Indeed Pipeline',
        status: 'Selected',
        timeline: [
          {
            stage: 'Applied',
            note: 'Indeed application registered.',
            date: new Date(Date.now() - 86400000 * 5),
            updatedBy: 'System',
          },
          {
            stage: 'Technical Interview',
            note: 'Portfolio reviewed and approved.',
            date: new Date(Date.now() - 86400000 * 3),
            updatedBy: 'Lead Designer',
          },
          {
            stage: 'HR Interview',
            note: 'Negotiation round closed.',
            date: new Date(Date.now() - 86400000 * 2),
            updatedBy: 'HR Lead',
          },
          {
            stage: 'Selected',
            note: 'Shortlisted for release.',
            date: new Date(),
            updatedBy: 'Super Admin',
          }
        ]
      },
      {
        orgId,
        fullName: 'Divya Rao',
        email: 'divya.rao@example.com',
        phone: '+919876543225',
        gender: 'Female',
        skills: ['Java', 'Spring Boot', 'MySQL', 'Kafka'],
        experienceYears: 5,
        source: 'Consultant Referral',
        status: 'Offer Sent',
        timeline: [
          {
            stage: 'Applied',
            note: 'CV submitted by consultant agency.',
            date: new Date(Date.now() - 86400000 * 10),
            updatedBy: 'System',
          },
          {
            stage: 'Technical Interview',
            note: 'Clear technical score of 4.5/5.',
            date: new Date(Date.now() - 86400000 * 5),
            updatedBy: 'Technical Manager',
          },
          {
            stage: 'Selected',
            note: 'Selected candidate for core engineer role.',
            date: new Date(Date.now() - 86400000 * 3),
            updatedBy: 'VP Engineering',
          },
          {
            stage: 'Offer Sent',
            note: 'Offer released.',
            date: new Date(),
            updatedBy: 'HR Manager',
          }
        ]
      }
    ]);
    console.log('🌱 Seeded default candidates for recruitment board');
  }

  // 7. Seed active employees with valid base salaries
  const employeeCountAfter = await Employee.countDocuments();
  let emp2Id, emp3Id;
  if (employeeCountAfter === 1) {
    const passwordHash = '$2a$10$oiQc3aHxbrksxPndNSWbHOv.Ijfq3PezD/x8J/ZUkj.GSNPghrHae'; // "password"
    
    const emp2 = await Employee.create({
      orgId,
      employeeId: 'EMP0002',
      name: 'Kyle Reese',
      firstName: 'Kyle',
      lastName: 'Reese',
      email: 'kyle.reese@wfm.com',
      phone: '+919888877777',
      gender: 'Male',
      dob: new Date('1985-05-15'),
      joiningDate: new Date('2024-01-10'),
      deptId,
      locationId,
      shiftId,
      role: 'Manager',
      status: 'Active',
      passwordHash,
      baseSalary: 75000,
      allowances: 18000,
      deductions: 6000,
      emergencyContact: { name: 'Sarah Reese', relationship: 'Spouse', phone: '+919888877777' },
    });
    emp2Id = emp2._id;

    const emp3 = await Employee.create({
      orgId,
      employeeId: 'EMP0003',
      name: 'Ellen Ripley',
      firstName: 'Ellen',
      lastName: 'Ripley',
      email: 'ellen.ripley@wfm.com',
      phone: '+919777766666',
      gender: 'Female',
      dob: new Date('1992-09-20'),
      joiningDate: new Date('2025-06-01'),
      deptId,
      locationId,
      shiftId,
      role: 'Employee',
      status: 'Active',
      passwordHash,
      baseSalary: 55000,
      allowances: 12000,
      deductions: 4000,
      emergencyContact: { name: 'Amanda Ripley', relationship: 'Child', phone: '+919777766666' },
    });
    emp3Id = emp3._id;
    console.log('🌱 Seeded additional test employees with salary metrics');
  } else {
    const e2 = await Employee.findOne({ email: 'kyle.reese@wfm.com' });
    emp2Id = e2?._id;
    const e3 = await Employee.findOne({ email: 'ellen.ripley@wfm.com' });
    emp3Id = e3?._id;
  }

  // 8. Seed some projects and tasks
  const Project = mongoose.models.Project || require('../models/Project').default;
  const Task = mongoose.models.Task || require('../models/Task').default;
  
  const projCount = await Project.countDocuments();
  if (projCount === 0) {
    const defaultMgr = emp2Id || (await Employee.findOne({ orgId }));
    const proj = await Project.create({
      orgId,
      name: 'Workforce Portal Rebuild',
      code: 'PORTAL',
      description: 'Upgrading visual layout grids to dark styling systems.',
      startDate: new Date(),
      status: 'Active',
      managerId: defaultMgr?._id || defaultMgr || emp2Id,
    });
    console.log('🌱 Seeded default project');

    await Task.create([
      {
        projectId: proj._id,
        assignedToId: emp3Id,
        title: 'Revamp CSS Variables',
        description: 'Update color system to premium HSL dark theme gradients.',
        priority: 'High',
        status: 'InProgress',
        dueDate: new Date(Date.now() + 86400000 * 5),
      },
      {
        projectId: proj._id,
        assignedToId: emp3Id,
        title: 'Configure JWT Interceptors',
        description: 'Verify auto-refresh headers retry loops.',
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date(Date.now() + 86400000 * 10),
      }
    ]);
    console.log('🌱 Seeded default tasks');
  }

  // 9. Seed assets
  const Asset = mongoose.models.Asset || require('../models/Asset').default;
  const assetCount = await Asset.countDocuments();
  if (assetCount === 0) {
    await Asset.create({
      orgId,
      name: 'MacBook Pro M3 Max',
      serialNumber: 'SN-MP9938812',
      type: 'Hardware',
      status: 'Assigned',
      assignedTo: emp3Id,
    });
    console.log('🌱 Seeded default assets');
  }

  // 10. Seed support tickets
  const HelpDeskTicket = mongoose.models.HelpDeskTicket || require('../models/HelpDeskTicket').default;
  const ticketCount = await HelpDeskTicket.countDocuments();
  if (ticketCount === 0) {
    await HelpDeskTicket.create({
      orgId,
      raisedById: emp3Id,
      subject: 'Developer setup database credentials issue',
      description: 'The seed script returns invalid password hashes.',
      category: 'IT',
      priority: 'High',
      status: 'InProgress',
      assignedToId: emp2Id,
    });
    console.log('🌱 Seeded default helpdesk tickets');
  }

  // 11. Seed leave requests
  const LeaveRequest = mongoose.models.LeaveRequest || require('../models/LeaveRequest').default;
  const leaveCount = await LeaveRequest.countDocuments();
  if (leaveCount === 0) {
    await LeaveRequest.create({
      orgId,
      employeeId: emp3Id,
      leaveType: 'Casual',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      reason: 'Personal appointments',
      status: 'Approved',
      approvedById: emp2Id,
    });
    console.log('🌱 Seeded default leave requests');
  }

  // 12. Seed target goals
  const Goal = mongoose.models.Goal || require('../models/Goal').default;
  const goalCount = await Goal.countDocuments();
  if (goalCount === 0) {
    await Goal.create({
      employeeId: emp3Id,
      title: 'Optimize API Response Times',
      progress: 40,
      status: 'InProgress',
      targetDate: new Date(Date.now() + 86400000 * 30),
    });
    console.log('🌱 Seeded default target goals');
  }

  // 13. Seed all 5 roles with clean credentials and related data (payroll, leaves, assets, notifications, goals, reviews)
  const rolesToSeed = [
    {
      email: 'superadmin@workforce.com',
      role: 'SuperAdmin',
      name: 'Super Admin User',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+919000000001',
    },
    {
      email: 'admin@workforce.com',
      role: 'OrgAdmin',
      name: 'Sonal Admin',
      firstName: 'Sonal',
      lastName: 'Admin',
      phone: '+919999988888',
    },
    {
      email: 'hr@workforce.com',
      role: 'HR',
      name: 'Hana Vance',
      firstName: 'Hana',
      lastName: 'Vance',
      phone: '+919000000002',
    },
    {
      email: 'manager@workforce.com',
      role: 'Manager',
      name: 'Kyle Reese',
      firstName: 'Kyle',
      lastName: 'Reese',
      phone: '+919888877777',
    },
    {
      email: 'employee@workforce.com',
      role: 'Employee',
      name: 'Ellen Ripley',
      firstName: 'Ellen',
      lastName: 'Ripley',
      phone: '+919777766666',
    },
  ];

  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('password', 10);

  const Payroll = mongoose.models.Payroll || require('../models/Payroll').default;
  const AssetAssignment = mongoose.models.AssetAssignment || require('../models/AssetAssignment').default;
  const Notification = mongoose.models.Notification || require('../models/Notification').default;
  const PerformanceReview = mongoose.models.PerformanceReview || require('../models/PerformanceReview').default;

  for (const item of rolesToSeed) {
    let emp = await Employee.findOne({ email: item.email });
    if (!emp) {
      emp = await Employee.create({
        orgId,
        employeeId: 'EMP-' + Math.floor(100000 + Math.random() * 900000).toString(),
        name: item.name,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        phone: item.phone,
        gender: 'Male',
        dob: new Date('1990-01-01'),
        joiningDate: new Date(),
        deptId,
        locationId,
        shiftId,
        role: item.role,
        status: 'Active',
        passwordHash,
        baseSalary: 65000,
        allowances: 15000,
        deductions: 5000,
        emergencyContact: {
          name: 'Backup Contact',
          relationship: 'Sibling',
          phone: item.phone,
        },
      });
      console.log(`🌱 Seeded employee account: ${item.email}`);
    }

    // Seed Payroll entries
    const payrollCountForEmp = await Payroll.countDocuments({ employeeId: emp._id });
    if (payrollCountForEmp === 0) {
      await Payroll.create([
        {
          employeeId: emp._id,
          month: 5,
          year: 2026,
          baseSalary: 65000,
          allowances: 15000,
          deductions: 5000,
          netPay: 75000,
          status: 'Paid',
        },
        {
          employeeId: emp._id,
          month: 6,
          year: 2026,
          baseSalary: 65000,
          allowances: 15000,
          deductions: 5000,
          netPay: 75000,
          status: 'Paid',
        },
      ]);
      console.log(`🌱 Seeded payroll entries for ${item.email}`);
    }

    // Seed Leave requests
    const leaveCountForEmp = await LeaveRequest.countDocuments({ employeeId: emp._id });
    if (leaveCountForEmp === 0) {
      await LeaveRequest.create([
        {
          orgId,
          employeeId: emp._id,
          leaveType: 'Casual',
          startDate: new Date(Date.now() - 86400000 * 10),
          endDate: new Date(Date.now() - 86400000 * 8),
          reason: 'Family vacation trip',
          status: 'Approved',
          approvedById: emp._id,
        },
        {
          orgId,
          employeeId: emp._id,
          leaveType: 'Sick',
          startDate: new Date(Date.now() + 86400000 * 2),
          endDate: new Date(Date.now() + 86400000 * 3),
          reason: 'Medical checkup',
          status: 'Pending',
        },
      ]);
      console.log(`🌱 Seeded leave requests for ${item.email}`);
    }

    // Seed Asset assignments
    const assetAssignmentCount = await AssetAssignment.countDocuments({ employeeId: emp._id });
    if (assetAssignmentCount === 0) {
      const serial = 'SN-' + item.role.toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000).toString();
      
      let ast = await Asset.findOne({ serialNumber: serial });
      if (!ast) {
        ast = await Asset.create({
          orgId,
          name: 'Developer MacBook Pro',
          serialNumber: serial,
          type: 'Hardware',
          status: 'Assigned',
        });
      }
      
      await AssetAssignment.create({
        assetId: ast._id,
        employeeId: emp._id,
        allocatedById: emp._id,
        assignedDate: new Date(),
        status: 'Active',
      });
      console.log(`🌱 Allocated laptop asset to ${item.email}`);
    }

    // Seed Notifications
    const notificationCount = await Notification.countDocuments({ recipientId: emp._id });
    if (notificationCount === 0) {
      await Notification.create([
        {
          recipientId: emp._id,
          title: 'Salary Credited successfully',
          message: 'Your salary payout for June 2026 has been credited to your bank account.',
          type: 'PAYROLL',
          isRead: false,
        },
        {
          recipientId: emp._id,
          title: 'Leave Vacation Approved',
          message: 'Your leave application for Casual Leave has been approved.',
          type: 'LEAVE',
          isRead: true,
        },
      ]);
      console.log(`🌱 Seeded notifications for ${item.email}`);
    }

    // Seed Performance Goals & Reviews
    const goalCountForEmp = await Goal.countDocuments({ employeeId: emp._id });
    if (goalCountForEmp === 0) {
      await Goal.create({
        employeeId: emp._id,
        title: 'Optimize API response times',
        progress: 80,
        status: 'InProgress',
        targetDate: new Date(Date.now() + 86400000 * 30),
      });
      console.log(`🌱 Seeded performance goals for ${item.email}`);
    }

    const reviewCountForEmp = await PerformanceReview.countDocuments({ employeeId: emp._id });
    if (reviewCountForEmp === 0) {
      await PerformanceReview.create({
        employeeId: emp._id,
        reviewerId: emp._id,
        reviewPeriod: 'H1-2026',
        rating: 4.5,
        feedback: 'Consistently demonstrates outstanding engineering practices.',
        status: 'Submitted',
      });
      console.log(`🌱 Seeded performance reviews for ${item.email}`);
    }
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
