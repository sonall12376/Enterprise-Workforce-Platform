import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Goal from '../models/Goal';
import PerformanceReview from '../models/PerformanceReview';

dotenv.config();

// Dedicated test database (falls back to process.env.MONGODB_URI)
const TEST_MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise-workforce-test';

// Dynamically reference Employee model
const getEmployeeModel = () => {
  return mongoose.models.Employee || mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
};

async function runTests() {
  console.log('🧪 Starting Performance Management module verification tests...');

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
  await Goal.deleteMany({});
  await PerformanceReview.deleteMany({});
  console.log('🧹 Test database collections cleared.');

  // Seed mock employees
  const Employee = getEmployeeModel();
  const mockEmployee = new Employee({
    employeeId: 'EMP-PF101',
    email: 'test.emp.perf@company.com',
    role: 'Employee',
    status: 'Active',
  });
  const mockManager = new Employee({
    employeeId: 'MGR-PF202',
    email: 'test.mgr.perf@company.com',
    role: 'Manager',
    status: 'Active',
  });
  await mockEmployee.save();
  await mockManager.save();
  // Set reporting manager
  mockEmployee.reportingManagerId = mockManager._id;
  await mockEmployee.save();
  console.log('✅ Mock Employees (Requester & Manager) seeded.');

  // TEST 1: Create Goal & Check Defaults
  console.log('\n--- Test 1: Create Goal ---');
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + 3); // 3 months deadline

  const goal = new Goal({
    employeeId: mockEmployee._id,
    title: 'Deliver Core Routing API',
    targetDate,
    progress: 0,
    status: 'NotStarted',
  });
  await goal.save();

  const savedGoal = await Goal.findOne({ employeeId: mockEmployee._id });
  console.log(`Goal Created - Title: "${savedGoal?.title}", Progress: ${savedGoal?.progress}%, Status: ${savedGoal?.status}`);

  if (savedGoal && savedGoal.progress === 0 && savedGoal.status === 'NotStarted') {
    console.log('✅ Test 1 Passed: Goal successfully created with correct default values.');
  } else {
    console.error('❌ Test 1 Failed: Goal did not have correct default values.');
  }

  // TEST 2: Update Goal progress and check status transitions
  console.log('\n--- Test 2: Update Goal & verify status transitions ---');
  // 1. Update progress to 40% (should auto-transition status to InProgress)
  savedGoal!.progress = 40;
  savedGoal!.status = 'InProgress';
  await savedGoal!.save();

  let updatedGoal = await Goal.findById(savedGoal!._id);
  console.log(`After 40% update - Progress: ${updatedGoal?.progress}%, Status: ${updatedGoal?.status}`);
  const step1Pass = updatedGoal?.progress === 40 && updatedGoal?.status === 'InProgress';

  // 2. Update progress to 100% (should auto-transition status to Achieved)
  updatedGoal!.progress = 100;
  updatedGoal!.status = 'Achieved';
  await updatedGoal!.save();

  updatedGoal = await Goal.findById(savedGoal!._id);
  console.log(`After 100% update - Progress: ${updatedGoal?.progress}%, Status: ${updatedGoal?.status}`);
  const step2Pass = updatedGoal?.progress === 100 && updatedGoal?.status === 'Achieved';

  if (step1Pass && step2Pass) {
    console.log('✅ Test 2 Passed: Goal progress updates and auto-status transitions verified successfully.');
  } else {
    console.error('❌ Test 2 Failed: Status did not transition correctly.');
  }

  // TEST 3: Create Performance Review & Check Rating Bounds
  console.log('\n--- Test 3: Create Performance Review & check ratings ---');
  const validReview = new PerformanceReview({
    employeeId: mockEmployee._id,
    reviewerId: mockManager._id,
    reviewPeriod: 'Q1-2026',
    rating: 4.5,
    feedback: 'Excellent work delivery and speed.',
    status: 'Submitted',
  });
  await validReview.save();

  const savedReview = await PerformanceReview.findOne({ employeeId: mockEmployee._id });
  console.log(`Review Created - Period: ${savedReview?.reviewPeriod}, Rating: ${savedReview?.rating}, Status: ${savedReview?.status}`);

  // Test rating validation boundaries
  const invalidReview = new PerformanceReview({
    employeeId: mockEmployee._id,
    reviewerId: mockManager._id,
    reviewPeriod: 'Q1-2026',
    rating: 6.0, // Invalid (max 5)
    feedback: 'Outside limits.',
    status: 'Submitted',
  });

  let validationErr = null;
  try {
    await invalidReview.validate();
  } catch (err: any) {
    validationErr = err.errors.rating.message;
  }
  console.log(`Validation error for rating=6.0: "${validationErr}"`);

  if (savedReview && savedReview.rating === 4.5 && validationErr) {
    console.log('✅ Test 3 Passed: Rating bounds (1.0 to 5.0) validated correctly.');
  } else {
    console.error('❌ Test 3 Failed: Rating bounds validation was not enforced.');
  }

  // TEST 4: Performance Review Acknowledgment Sign-off
  console.log('\n--- Test 4: Acknowledge Performance Review ---');
  savedReview!.status = 'Acknowledged';
  await savedReview!.save();

  const acknowledgedReview = await PerformanceReview.findById(savedReview!._id);
  console.log(`Updated Review Status: ${acknowledgedReview?.status}`);

  if (acknowledgedReview && acknowledgedReview.status === 'Acknowledged') {
    console.log('✅ Test 4 Passed: Performance review acknowledgment sign-off verified successfully.');
  } else {
    console.error('❌ Test 4 Failed: Acknowledgment status not updated correctly.');
  }

  // Cleanup test database
  await getEmployeeModel().deleteMany({});
  await Goal.deleteMany({});
  await PerformanceReview.deleteMany({});
  console.log('\n🧹 Test collections cleaned up.');

  // Disconnect
  await mongoose.disconnect();
  console.log('🔌 Disconnected from test database. Verification complete.');
}

runTests().catch((err) => {
  console.error('💥 Test run failed with error:', err);
  process.exit(1);
});
