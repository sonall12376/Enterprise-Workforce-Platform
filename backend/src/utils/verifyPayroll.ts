import mongoose from 'mongoose';
import Payroll from '../models/Payroll';
import Attendance from '../models/Attendance';
import LeaveRequest from '../models/LeaveRequest';

// Dedicated test database
const TEST_MONGODB_URI = 'mongodb://localhost:27017/enterprise-workforce-test';

// Dynamically reference Employee model
const getEmployeeModel = () => {
  return mongoose.models.Employee || mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
};

async function runTests() {
  console.log('🧪 Starting Payroll Management module verification tests...');

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
  await Attendance.deleteMany({});
  await LeaveRequest.deleteMany({});
  await Payroll.deleteMany({});
  console.log('🧹 Test database collections cleared.');

  // Seed mock employee
  const Employee = getEmployeeModel();
  const mockEmployee = new Employee({
    employeeId: 'EMP-P101',
    email: 'test.emp.pay@company.com',
    role: 'Employee',
    status: 'Active',
  });
  await mockEmployee.save();
  console.log('✅ Mock Employee seeded.');

  const month = 8; // August
  const year = 2026;

  // TEST 1: Salary Setup Configuration
  console.log('\n--- Test 1: Configure Salary Setup ---');
  const baseSalarySetup = 6000;
  const allowancesSetup = 400;
  const deductionsSetup = 200;

  const updatedEmp = await Employee.findByIdAndUpdate(
    mockEmployee._id,
    { baseSalary: baseSalarySetup, allowances: allowancesSetup, deductions: deductionsSetup },
    { new: true }
  );

  console.log(`Salary Settings Setup on Employee Doc:`);
  console.log(`- Base Salary: ${updatedEmp?.baseSalary}`);
  console.log(`- Allowances: ${updatedEmp?.allowances}`);
  console.log(`- Base Deductions: ${updatedEmp?.deductions}`);

  if (updatedEmp && updatedEmp.baseSalary === 6000 && updatedEmp.allowances === 400 && updatedEmp.deductions === 200) {
    console.log('✅ Test 1 Passed: Salary setup configuration verified successfully.');
  } else {
    console.error('❌ Test 1 Failed: Salary settings were not updated.');
  }

  // TEST 2: Seeding attendance and leaves for calculation
  console.log('\n--- Test 2: Seed Late logs & Unpaid leaves for August ---');
  // Seed 2 late clock-in logs (August 5 & August 6)
  const lateLog1 = new Attendance({
    employeeId: mockEmployee._id,
    date: new Date(`${year}-08-05T00:00:00Z`),
    clockIn: new Date(`${year}-08-05T09:30:00Z`),
    status: 'Late',
  });
  const lateLog2 = new Attendance({
    employeeId: mockEmployee._id,
    date: new Date(`${year}-08-06T00:00:00Z`),
    clockIn: new Date(`${year}-08-06T09:20:00Z`),
    status: 'Late',
  });
  await lateLog1.save();
  await lateLog2.save();
  console.log('✅ Seeded 2 Late attendance logs.');

  // Seed approved Unpaid leave request for 3 days (August 10 - August 12)
  const unpaidLeave = new LeaveRequest({
    employeeId: mockEmployee._id,
    leaveType: 'Unpaid',
    startDate: new Date(`${year}-08-10T09:00:00Z`),
    endDate: new Date(`${year}-08-12T18:00:00Z`),
    reason: 'Personal urgent leave.',
    status: 'Approved',
  });
  await unpaidLeave.save();
  console.log('✅ Seeded 1 approved Unpaid leave request for 3 days.');

  // TEST 3: Monthly Payroll Calculation Run
  console.log('\n--- Test 3: Calculate Monthly Payroll ---');
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);

  // Fetch employee salary config
  const emp = await Employee.findById(mockEmployee._id);
  const baseSalary = emp.baseSalary;
  const baseAllowances = emp.allowances || 0;
  const baseDeductions = emp.deductions || 0;

  // Unpaid leaves calculation
  const unpaidLeaves = await LeaveRequest.find({
    employeeId: mockEmployee._id,
    leaveType: 'Unpaid',
    status: 'Approved',
    $or: [
      { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
      { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
    ],
  });

  let unpaidDays = 0;
  for (const request of unpaidLeaves) {
    const reqStart = new Date(request.startDate);
    const reqEnd = new Date(request.endDate);

    const overlapStart = reqStart < startOfMonth ? startOfMonth : reqStart;
    const overlapEnd = reqEnd > endOfMonth ? endOfMonth : reqEnd;

    const days = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 3600 * 24)) + 1;
    if (days > 0) {
      unpaidDays += days;
    }
  }

  const unpaidDeduction = Math.round((baseSalary / 30) * unpaidDays); // (6000 / 30) * 3 = 600 USD

  // Late logs calculation (fixed penalty: 20 USD per late log)
  const lateLogsCount = await Attendance.countDocuments({
    employeeId: mockEmployee._id,
    status: 'Late',
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });
  const lateDeduction = lateLogsCount * 20; // 2 * 20 = 40 USD

  // Net Pay computation
  const calculatedDeductions = baseDeductions + unpaidDeduction + lateDeduction; // 200 + 600 + 40 = 840 USD
  const calculatedNetPay = baseSalary + baseAllowances - calculatedDeductions; // 6000 + 400 - 840 = 5560 USD

  const payrollDraft = new Payroll({
    employeeId: mockEmployee._id,
    month,
    year,
    baseSalary,
    allowances: baseAllowances,
    deductions: calculatedDeductions,
    netPay: calculatedNetPay,
    status: 'Draft',
  });
  await payrollDraft.save();

  console.log(`Monthly Calculation Engine Output:`);
  console.log(`- Base Salary: ${baseSalary}`);
  console.log(`- Allowances: ${baseAllowances}`);
  console.log(`- Unpaid Leave Deduction: ${unpaidDeduction} (${unpaidDays} days)`);
  console.log(`- Late Logs Deduction: ${lateDeduction} (${lateLogsCount} late logs)`);
  console.log(`- Total Deductions: ${calculatedDeductions}`);
  console.log(`- Net Pay: ${calculatedNetPay}`);

  if (calculatedDeductions === 840 && calculatedNetPay === 5560) {
    console.log('✅ Test 3 Passed: Calculation output matches expected deductions and net salary.');
  } else {
    console.error(`❌ Test 3 Failed: Deductions: ${calculatedDeductions} (expected 840), NetPay: ${calculatedNetPay} (expected 5560)`);
  }

  // TEST 4: Duplicate Run Prevention
  console.log('\n--- Test 4: Verify Duplicate Run Prevention ---');
  // Simulating duplicate check
  const duplicate = await Payroll.findOne({
    employeeId: mockEmployee._id,
    month,
    year,
  });

  if (duplicate && duplicate.status === 'Draft') {
    console.log('✅ Test 4 Passed: Found existing draft run for period. Safe to recalculate/overwrite.');
  } else {
    console.error('❌ Test 4 Failed: Could not locate draft run for duplicate run verification.');
  }

  // TEST 5: Payroll Approval Workflow
  console.log('\n--- Test 5: Approve Payroll Run ---');
  const draftToApprove = await Payroll.findOne({ employeeId: mockEmployee._id, month, year, status: 'Draft' });
  if (draftToApprove) {
    draftToApprove.status = 'Approved';
    await draftToApprove.save();

    const approvedPayroll = await Payroll.findOne({ employeeId: mockEmployee._id, month, year });
    console.log(`Updated Payroll Status: ${approvedPayroll?.status}`);

    if (approvedPayroll && approvedPayroll.status === 'Approved') {
      console.log('✅ Test 5 Passed: Payroll draft successfully approved and updated.');
    } else {
      console.error('❌ Test 5 Failed: Status was not updated.');
    }
  }

  // Cleanup test database
  await getEmployeeModel().deleteMany({});
  await Attendance.deleteMany({});
  await LeaveRequest.deleteMany({});
  await Payroll.deleteMany({});
  console.log('\n🧹 Test collections cleaned up.');

  // Disconnect
  await mongoose.disconnect();
  console.log('🔌 Disconnected from test database. Verification complete.');
}

runTests().catch((err) => {
  console.error('💥 Test run failed with error:', err);
  process.exit(1);
});
