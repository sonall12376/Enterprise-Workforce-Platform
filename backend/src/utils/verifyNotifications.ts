import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { createSystemNotification } from '../controllers/notification/notificationController';

// Dedicated test database
const TEST_MONGODB_URI = 'mongodb://localhost:27017/enterprise-workforce-test';

// Dynamically reference Employee model
const getEmployeeModel = () => {
  return mongoose.models.Employee || mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
};

async function runTests() {
  console.log('🧪 Starting Notifications Management module verification tests...');

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
  await Notification.deleteMany({});
  console.log('🧹 Test database collections cleared.');

  // Seed mock employee
  const Employee = getEmployeeModel();
  const mockEmployee = new Employee({
    employeeId: 'EMP-N101',
    email: 'test.emp.notify@company.com',
    role: 'Employee',
    status: 'Active',
  });
  await mockEmployee.save();
  console.log('✅ Mock Employee seeded.');

  // TEST 1: Create System Notification (and dispatch mock email)
  console.log('\n--- Test 1: Create System Notification & send Email ---');
  await createSystemNotification(
    mockEmployee._id,
    'Leave Request Approved',
    'Your Casual leave request for 3 days was approved by your manager.',
    'LEAVE'
  );

  // Wait a short duration to let background email dispatch finish
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const savedNotification = await Notification.findOne({ recipientId: mockEmployee._id });
  console.log(`Notification Created - Title: "${savedNotification?.title}", Message: "${savedNotification?.message}", isRead: ${savedNotification?.isRead}`);

  if (savedNotification && savedNotification.title === 'Leave Request Approved' && !savedNotification.isRead) {
    console.log('✅ Test 1 Passed: Notification created successfully.');
  } else {
    console.error('❌ Test 1 Failed: Notification was not created properly.');
  }

  // TEST 2: Retrieve Notifications
  console.log('\n--- Test 2: Retrieve Notifications ---');
  const notifications = await Notification.find({ recipientId: mockEmployee._id, isRead: false });
  console.log(`Found ${notifications.length} unread notification(s) for user.`);

  if (notifications.length === 1) {
    console.log('✅ Test 2 Passed: Correct unread count fetched.');
  } else {
    console.error('❌ Test 2 Failed: Unread count mismatch.');
  }

  // TEST 3: Mark Single Notification as Read
  console.log('\n--- Test 3: Mark Single Notification as Read ---');
  savedNotification!.isRead = true;
  await savedNotification!.save();

  const updatedNotification = await Notification.findById(savedNotification!._id);
  console.log(`Notification Status - isRead: ${updatedNotification?.isRead}`);

  if (updatedNotification && updatedNotification.isRead) {
    console.log('✅ Test 3 Passed: Notification marked read successfully.');
  } else {
    console.error('❌ Test 3 Failed: Status did not update.');
  }

  // TEST 4: Mark All Notifications as Read
  console.log('\n--- Test 4: Mark All Notifications as Read ---');
  // Create another unread notification first
  await createSystemNotification(
    mockEmployee._id,
    'New Payslip Generated',
    'Your payslip for July 2026 is ready to view.',
    'PAYROLL'
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let unreadCountBefore = await Notification.countDocuments({ recipientId: mockEmployee._id, isRead: false });
  console.log(`Unread count before clearing all: ${unreadCountBefore}`);

  // Clear all
  await Notification.updateMany({ recipientId: mockEmployee._id, isRead: false }, { $set: { isRead: true } });

  let unreadCountAfter = await Notification.countDocuments({ recipientId: mockEmployee._id, isRead: false });
  console.log(`Unread count after clearing all: ${unreadCountAfter}`);

  if (unreadCountBefore === 1 && unreadCountAfter === 0) {
    console.log('✅ Test 4 Passed: All notifications cleared successfully.');
  } else {
    console.error('❌ Test 4 Failed: Clear all command failed to update all records.');
  }

  // Cleanup test database
  await getEmployeeModel().deleteMany({});
  await Notification.deleteMany({});
  console.log('\n🧹 Test collections cleaned up.');

  // Disconnect
  await mongoose.disconnect();
  console.log('🔌 Disconnected from test database. Verification complete.');
}

runTests().catch((err) => {
  console.error('💥 Test run failed with error:', err);
  process.exit(1);
});
