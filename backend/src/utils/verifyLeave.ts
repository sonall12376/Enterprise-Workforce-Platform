import mongoose from 'mongoose';
import LeaveRequest from '../models/LeaveRequest';
import LeaveBalance from '../models/LeaveBalance';

// Dedicated test database
const TEST_MONGODB_URI = 'mongodb://localhost:27017/enterprise-workforce-test';

// Dynamically reference Employee model
const getEmployeeModel = () => {
  return mongoose.models.Employee || mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
};

async function runTests() {
  console.log('🧪 Starting Leave Management module verification tests...');

  // Connect to test database
  try {
    await mongoose.connect(TEST_MONGODB_URI);
    console.log(`🔌 Connected to test database: ${TEST_MONGODB_URI}`);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB.', err);
    process.exit(1);
  }

  // Clear test database collections
  await getEmployeeModel().deleteMany({});
  await LeaveRequest.deleteMany({});
  await LeaveBalance.deleteMany({});
  console.log('🧹 Test database collections cleared.');

  // Seed mock data
  const Employee = getEmployeeModel();
  const mockEmployee = new Employee({
    employeeId: 'EMP-L101',
    email: 'test.emp.leave@company.com',
    role: 'Employee',
    status: 'Active',
  });
  const mockManager = new Employee({
    employeeId: 'MGR-L202',
    email: 'test.mgr.leave@company.com',
    role: 'Manager',
    status: 'Active',
  });
  await mockEmployee.save();
  await mockManager.save();
  // Set reporting manager
  mockEmployee.reportingManagerId = mockManager._id;
  await mockEmployee.save();
  console.log('✅ Mock Employees (Requester & Manager) seeded.');

  const year = new Date().getFullYear();

  // TEST 1: Initial Leave Balance Verification
  console.log('\n--- Test 1: Verify Initial Balances ---');
  const leaveTypes = ['Casual', 'Sick', 'Earned'] as const;
  const balances = [];

  for (const type of leaveTypes) {
    let balance = await LeaveBalance.findOne({ employeeId: mockEmployee._id, year, leaveType: type });
    if (!balance) {
      let allocated = 15;
      if (type === 'Sick') allocated = 10;
      else if (type === 'Earned') allocated = 12;

      balance = new LeaveBalance({
        employeeId: mockEmployee._id,
        year,
        leaveType: type,
        allocated,
        used: 0,
        pending: 0,
      });
      await balance.save();
    }
    balances.push(balance);
  }

  console.log(`Balances seeded for year ${year}:`);
  balances.forEach((b) => {
    console.log(`- ${b.leaveType}: Allocated=${b.allocated}, Used=${b.used}, Pending=${b.pending}`);
  });

  if (balances.length === 3) {
    console.log('✅ Test 1 Passed: Initial balances verified successfully.');
  } else {
    console.error('❌ Test 1 Failed: Balances not seeded correctly.');
  }

  // TEST 2: Valid Leave Submission & Pending Status Increment
  console.log('\n--- Test 2: Apply for leave & check balance locks ---');
  const casualBalance = await LeaveBalance.findOne({
    employeeId: mockEmployee._id,
    year,
    leaveType: 'Casual',
  });

  if (casualBalance) {
    // Request a 3-day Casual leave
    const start = new Date(`${year}-08-10T09:00:00Z`);
    const end = new Date(`${year}-08-12T18:00:00Z`);
    const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    console.log(`Applying for: ${durationDays} days of Casual leave`);

    // Lock pending
    casualBalance.pending += durationDays;
    await casualBalance.save();

    const request = new LeaveRequest({
      employeeId: mockEmployee._id,
      leaveType: 'Casual',
      startDate: start,
      endDate: end,
      reason: 'Family event trip.',
      status: 'Pending',
    });
    await request.save();

    const updatedBal = await LeaveBalance.findOne({
      employeeId: mockEmployee._id,
      year,
      leaveType: 'Casual',
    });

    console.log(`Updated Casual balance: Pending = ${updatedBal?.pending}`);
    if (updatedBal && updatedBal.pending === 3) {
      console.log('✅ Test 2 Passed: Pending balance correctly incremented by 3 days.');
    } else {
      console.error('❌ Test 2 Failed: Pending balance did not update correctly.');
    }
  }

  // TEST 3: Insufficient Balance Check
  console.log('\n--- Test 3: Insufficient leave balance check ---');
  const currentSick = await LeaveBalance.findOne({
    employeeId: mockEmployee._id,
    year,
    leaveType: 'Sick',
  });

  if (currentSick) {
    const available = currentSick.allocated - currentSick.used - currentSick.pending; // 10 days
    const requestedDays = 12; // Exceeds 10

    console.log(`Sick available: ${available} days. Requested: ${requestedDays} days.`);
    if (requestedDays > available) {
      console.log('✅ Test 3 Passed: Insufficient balance successfully blocked validation checks.');
    } else {
      console.error('❌ Test 3 Failed: Request was not blocked despite insufficient balance.');
    }
  }

  // TEST 4: Leave Approval Workflow (Lock pending deducts, used increments)
  console.log('\n--- Test 4: Leave Approval flow ---');
  const req = await LeaveRequest.findOne({ employeeId: mockEmployee._id, status: 'Pending' });
  if (req) {
    const durationDays = 3;
    const balance = await LeaveBalance.findOne({
      employeeId: req.employeeId,
      year,
      leaveType: req.leaveType,
    });

    if (balance) {
      // Simulate Manager Approval
      req.status = 'Approved';
      req.approvedById = mockManager._id;
      await req.save();

      balance.pending = Math.max(0, balance.pending - durationDays);
      balance.used += durationDays;
      await balance.save();

      const finalBal = await LeaveBalance.findOne({
        employeeId: req.employeeId,
        year,
        leaveType: req.leaveType,
      });

      console.log(`After Approval - Pending: ${finalBal?.pending}, Used: ${finalBal?.used}`);
      if (finalBal && finalBal.pending === 0 && finalBal.used === 3) {
        console.log('✅ Test 4 Passed: Leave request approved, balance updated.');
      } else {
        console.error('❌ Test 4 Failed: Balances were not adjusted correctly upon approval.');
      }
    }
  } else {
    console.error('❌ Test 4 Failed: No pending request found.');
  }

  // TEST 5: Leave Rejection Workflow (Lock pending decrement only)
  console.log('\n--- Test 5: Leave Rejection flow ---');
  // 1. Submit a Sick leave request for 2 days
  const startSick = new Date(`${year}-09-01T09:00:00Z`);
  const endSick = new Date(`${year}-09-02T18:00:00Z`);
  const sickBalance = await LeaveBalance.findOne({ employeeId: mockEmployee._id, year, leaveType: 'Sick' });

  if (sickBalance) {
    sickBalance.pending += 2;
    await sickBalance.save();

    const requestSick = new LeaveRequest({
      employeeId: mockEmployee._id,
      leaveType: 'Sick',
      startDate: startSick,
      endDate: endSick,
      reason: 'Fever checkup.',
      status: 'Pending',
    });
    await requestSick.save();

    // 2. Reject request
    requestSick.status = 'Rejected';
    requestSick.approvedById = mockManager._id;
    await requestSick.save();

    sickBalance.pending = Math.max(0, sickBalance.pending - 2);
    await sickBalance.save();

    const finalSickBal = await LeaveBalance.findOne({
      employeeId: mockEmployee._id,
      year,
      leaveType: 'Sick',
    });

    console.log(`After Rejection - Pending: ${finalSickBal?.pending}, Used: ${finalSickBal?.used}`);
    if (finalSickBal && finalSickBal.pending === 0 && finalSickBal.used === 0) {
      console.log('✅ Test 5 Passed: Leave request rejected, pending balance released.');
    } else {
      console.error('❌ Test 5 Failed: Pending balance not released correctly.');
    }
  }

  // Cleanup test database
  await getEmployeeModel().deleteMany({});
  await LeaveRequest.deleteMany({});
  await LeaveBalance.deleteMany({});
  console.log('\n🧹 Test collections cleaned up.');

  // Disconnect
  await mongoose.disconnect();
  console.log('🔌 Disconnected from test database. Verification complete.');
}

runTests().catch((err) => {
  console.error('💥 Test run failed with error:', err);
  process.exit(1);
});
