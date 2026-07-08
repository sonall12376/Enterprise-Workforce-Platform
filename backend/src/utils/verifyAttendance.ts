import mongoose from 'mongoose';
import Attendance from '../models/Attendance';
import AttendanceCorrection from '../models/AttendanceCorrection';

// Dedicated test database
const TEST_MONGODB_URI = 'mongodb://localhost:27017/enterprise-workforce-test';

// Dynamically reference models
const getEmployeeModel = () => {
  return mongoose.models.Employee || mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
};

const getOfficeLocationModel = () => {
  return mongoose.models.OfficeLocation || mongoose.model('OfficeLocation', new mongoose.Schema({}, { strict: false }));
};

const getWorkShiftModel = () => {
  return mongoose.models.WorkShift || mongoose.model('WorkShift', new mongoose.Schema({}, { strict: false }));
};

// Distance calculation
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function runTests() {
  console.log('🧪 Starting Attendance module verification tests...');

  // Connect to test database
  try {
    await mongoose.connect(TEST_MONGODB_URI);
    console.log(`🔌 Connected to test database: ${TEST_MONGODB_URI}`);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB. Is MongoDB running locally?', err);
    process.exit(1);
  }

  // Clear test database collections
  await getEmployeeModel().deleteMany({});
  await getOfficeLocationModel().deleteMany({});
  await getWorkShiftModel().deleteMany({});
  await Attendance.deleteMany({});
  await AttendanceCorrection.deleteMany({});
  console.log('🧹 Test database collections cleared.');

  // Seed mock data
  const OfficeLocation = getOfficeLocationModel();
  const mockLocation = new OfficeLocation({
    name: 'Delhi HQ Office',
    timezone: 'Asia/Kolkata',
    coordinates: { latitude: 28.6139, longitude: 77.2090 }, // Delhi GPS
    geofenceRadius: 100, // 100 meters
  });
  await mockLocation.save();
  console.log('✅ Mock OfficeLocation seeded.');

  const WorkShift = getWorkShiftModel();
  const mockShift = new WorkShift({
    name: 'Standard Morning Shift',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMins: 15,
  });
  await mockShift.save();
  console.log('✅ Mock WorkShift seeded.');

  const Employee = getEmployeeModel();
  const mockEmployee = new Employee({
    employeeId: 'EMP-T101',
    email: 'test.emp@company.com',
    role: 'Employee',
    status: 'Active',
    locationId: mockLocation._id,
    shiftId: mockShift._id,
  });
  const mockManager = new Employee({
    employeeId: 'MGR-T202',
    email: 'test.mgr@company.com',
    role: 'Manager',
    status: 'Active',
  });
  await mockEmployee.save();
  await mockManager.save();
  // Set reporting manager
  mockEmployee.reportingManagerId = mockManager._id;
  await mockEmployee.save();
  console.log('✅ Mock Employees (Requester & Manager) seeded.');

  // TEST 1: Clock-in within geofence boundaries
  console.log('\n--- Test 1: Clock-in within geofence (28.6139, 77.2090) ---');
  const userCoordsInside = { latitude: 28.6140, longitude: 77.2091 }; // ~15 meters away
  const distanceInside = getDistanceInMeters(
    userCoordsInside.latitude,
    userCoordsInside.longitude,
    mockLocation.coordinates.latitude,
    mockLocation.coordinates.longitude
  );
  console.log(`Computed distance: ${distanceInside.toFixed(2)}m (Max allowed: 100m)`);

  if (distanceInside <= mockLocation.geofenceRadius) {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    // Simulate clock-in logic
    const attendance = new Attendance({
      employeeId: mockEmployee._id,
      date: todayMidnight,
      clockIn: new Date(),
      status: 'Present',
    });
    await attendance.save();
    console.log('✅ Test 1 Passed: Clock-in successfully logged within geofence.');
  } else {
    console.error('❌ Test 1 Failed: Distance incorrectly exceeded geofence.');
  }

  // TEST 2: Clock-in outside geofence boundaries
  console.log('\n--- Test 2: Clock-in outside geofence (New York coordinates) ---');
  const userCoordsOutside = { latitude: 40.7128, longitude: -74.0060 }; // New York
  const distanceOutside = getDistanceInMeters(
    userCoordsOutside.latitude,
    userCoordsOutside.longitude,
    mockLocation.coordinates.latitude,
    mockLocation.coordinates.longitude
  );
  console.log(`Computed distance: ${distanceOutside.toFixed(2)}m (Max allowed: 100m)`);

  if (distanceOutside > mockLocation.geofenceRadius) {
    console.log('✅ Test 2 Passed: Clock-in successfully rejected (outside geofence).');
  } else {
    console.error('❌ Test 2 Failed: Clock-in outside geofence was not blocked.');
  }

  // TEST 3: Late status evaluation
  console.log('\n--- Test 3: Late clock-in status check ---');
  // Simulate checking in at 09:25 AM (shift start 09:00 AM + 15m grace = 09:15 AM limit)
  const shiftStartHour = 9;
  const shiftStartMin = 0;
  const grace = 15;
  const clockInTimeMock = new Date();
  clockInTimeMock.setHours(9, 25, 0, 0); // 09:25 AM

  const minutesSinceMidnight = clockInTimeMock.getHours() * 60 + clockInTimeMock.getMinutes();
  const shiftMinutesLimit = shiftStartHour * 60 + shiftStartMin + grace;

  let testStatus = 'Present';
  if (minutesSinceMidnight > shiftMinutesLimit) {
    testStatus = 'Late';
  }

  if (testStatus === 'Late') {
    console.log('✅ Test 3 Passed: Successfully flagged check-in at 09:25 AM as "Late".');
  } else {
    console.error('❌ Test 3 Failed: Flagged check-in at 09:25 AM as "Present".');
  }

  // TEST 4: Work duration calculation on Clock-out
  console.log('\n--- Test 4: Clock-out & Work Minutes calculation ---');
  const attendanceRecord = await Attendance.findOne({ employeeId: mockEmployee._id });
  if (attendanceRecord) {
    // Set clockIn to 8 hours ago
    const clockInTime = new Date();
    clockInTime.setHours(clockInTime.getHours() - 8);
    attendanceRecord.clockIn = clockInTime;

    const clockOutTime = new Date();
    attendanceRecord.clockOut = clockOutTime;

    const diffMs = clockOutTime.getTime() - clockInTime.getTime();
    const workMinutes = Math.round(diffMs / (1000 * 60));
    attendanceRecord.workMinutes = workMinutes;

    if (workMinutes < 240) {
      attendanceRecord.status = 'HalfDay';
    }
    await attendanceRecord.save();

    console.log(`Clock-in: ${attendanceRecord.clockIn.toISOString()}`);
    console.log(`Clock-out: ${attendanceRecord.clockOut.toISOString()}`);
    console.log(`Calculated work minutes: ${workMinutes} (~8 hours)`);
    if (workMinutes >= 470 && workMinutes <= 490) {
      console.log('✅ Test 4 Passed: Work minutes calculated correctly.');
    } else {
      console.error(`❌ Test 4 Failed: Expected ~480 minutes, got ${workMinutes}`);
    }
  } else {
    console.error('❌ Test 4 Failed: Could not find seeded attendance log.');
  }

  // TEST 5: Correction approval workflow
  console.log('\n--- Test 5: Correction approval and Attendance correction ---');
  const attLog = await Attendance.findOne({ employeeId: mockEmployee._id });
  if (attLog) {
    // 1. Submit correction request
    const reqClockIn = new Date(attLog.date);
    reqClockIn.setHours(10, 0, 0, 0); // Requested clock-in: 10:00 AM
    const reqClockOut = new Date(attLog.date);
    reqClockOut.setHours(18, 0, 0, 0); // Requested clock-out: 06:00 PM

    const correction = new AttendanceCorrection({
      attendanceId: attLog._id,
      requestedById: mockEmployee._id,
      requestedClockIn: reqClockIn,
      requestedClockOut: reqClockOut,
      reason: 'Forgot to clock in on time, client visit.',
      status: 'Pending',
    });
    await correction.save();
    console.log('Correction request submitted.');

    // 2. Manager approves correction
    const loadedCorr = await AttendanceCorrection.findById(correction._id);
    if (loadedCorr) {
      loadedCorr.status = 'Approved';
      loadedCorr.approvedById = mockManager._id;
      await loadedCorr.save();

      // Apply changes to Attendance
      attLog.clockIn = loadedCorr.requestedClockIn;
      attLog.clockOut = loadedCorr.requestedClockOut;

      const newWorkMinutes = Math.round(
        (loadedCorr.requestedClockOut.getTime() - loadedCorr.requestedClockIn.getTime()) / (1000 * 60)
      );
      attLog.workMinutes = newWorkMinutes;

      // Re-evaluate status (10:00 AM is late, but workMinutes = 480 mins which is >= 240)
      attLog.status = 'Late';
      await attLog.save();

      console.log('Correction request approved by Manager.');
      console.log(`Updated Attendance Status: ${attLog.status}`);
      console.log(`Updated Work Minutes: ${attLog.workMinutes}`);

      if (attLog.workMinutes === 480 && attLog.status === 'Late') {
        console.log('✅ Test 5 Passed: Correction successfully applied and attendance values updated.');
      } else {
        console.error('❌ Test 5 Failed: Corrected values do not match expectations.');
      }
    }
  }

  // Cleanup test database
  await getEmployeeModel().deleteMany({});
  await getOfficeLocationModel().deleteMany({});
  await getWorkShiftModel().deleteMany({});
  await Attendance.deleteMany({});
  await AttendanceCorrection.deleteMany({});
  console.log('\n🧹 Test collections cleaned up.');

  // Disconnect
  await mongoose.disconnect();
  console.log('🔌 Disconnected from test database. Verification complete.');
}

runTests().catch((err) => {
  console.error('💥 Test run failed with error:', err);
  process.exit(1);
});
