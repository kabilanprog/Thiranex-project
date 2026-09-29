/* ==========================================================
   Database seed - loads the sample data shown in the project
   (users, courses and enrollments collections)

   Run from the project root:   npm run seed
   or from the backend folder:  npm run seed
   ========================================================== */
const path = require('path');

const BACKEND = path.join(__dirname, '..', 'backend');
// Resolve packages from backend/node_modules (this folder has no node_modules of its own)
const need = (name) => require(require.resolve(name, { paths: [BACKEND] }));

const mongoose = need('mongoose');
const bcrypt = need('bcryptjs');
const dotenv = need('dotenv');
dotenv.config({ path: path.join(BACKEND, '.env') });

const connectDB = require('../backend/config/db');
const { isLocalDB } = require('../backend/config/db');
const { seedDefaultData } = require('../backend/config/localStore');
const User = require('../backend/models/User');
const Course = require('../backend/models/Course');
const Enrollment = require('../backend/models/Enrollment');

const DEFAULT_PASSWORD = 'Pass1234';

const run = async () => {
  await connectDB();

  if (isLocalDB()) {
    seedDefaultData();
  } else {
    await Promise.all([User.deleteMany({}), Course.deleteMany({}), Enrollment.deleteMany({})]);
    await Promise.all([User.syncIndexes(), Enrollment.syncIndexes()]);

    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // ---- users ----
    const [kabilan, hariharan, divya, arun, priya] = await User.insertMany([
      { name: 'Kabilan S',    email: 'kabilan@student.edu',   password: hash, role: 'student', createdAt: new Date('2026-07-08') },
      { name: 'Hariharan M',  email: 'hariharan@thiranex.in', password: hash, role: 'admin',   createdAt: new Date('2026-06-01') },
      { name: 'Divya S',      email: 'divya@student.edu',     password: hash, role: 'student', createdAt: new Date('2026-07-09') },
      { name: 'Arun K',       email: 'arun@student.edu',      password: hash, role: 'student', createdAt: new Date('2026-07-10') },
      { name: 'Priya R',      email: 'priya@thiranex.in',     password: hash, role: 'admin',   createdAt: new Date('2026-06-02') }
    ]);

    // ---- courses ----
    const [fullStack, sql, react, node, mongo, git] = await Course.insertMany([
      {
        title: 'Full Stack Web Development', category: 'Web Dev', instructor: 'Mr. Hariharan M',
        duration: '4 Weeks', seatsAvailable: 12,
        description: 'HTML, CSS, JS, Node.js, Express, MongoDB — build complete web apps end to end.'
      },
      {
        title: 'Database Management (SQL)', category: 'Database', instructor: 'Ms. Priya R',
        duration: '3 Weeks', seatsAvailable: 18,
        description: 'Learn relational database design, SQL queries and stored procedures.'
      },
      {
        title: 'React JS Fundamentals', category: 'Frontend', instructor: 'Mr. Arun K',
        duration: '2 Weeks', seatsAvailable: 25,
        description: 'Component-based UI development using modern React practices.'
      },
      {
        title: 'Node.js & Express Basics', category: 'Backend', instructor: 'Mr. Hariharan M',
        duration: '3 Weeks', seatsAvailable: 9,
        description: 'Build REST APIs and server-side logic using Node.js and Express.'
      },
      {
        title: 'MongoDB Essentials', category: 'Database', instructor: 'Ms. Divya S',
        duration: '2 Weeks', seatsAvailable: 20,
        description: 'NoSQL database design, schemas and integration with Node.js apps.'
      },
      {
        title: 'Git & GitHub Basics', category: 'Tools', instructor: 'Mr. Arun K',
        duration: '1 Week', seatsAvailable: 30,
        description: 'Version control, branching, and collaboration workflow for developers.'
      }
    ]);

    // ---- enrollments ----
    await Enrollment.insertMany([
      { student: kabilan._id, course: fullStack._id, batch: 'Morning Batch (10 AM - 12 PM)',   enrolledOn: new Date('2026-07-09'), status: 'active' },
      { student: kabilan._id, course: node._id,      batch: 'Afternoon Batch (2 PM - 4 PM)',   enrolledOn: new Date('2026-07-15'), status: 'active' },
      { student: divya._id,   course: mongo._id,     batch: 'Morning Batch (10 AM - 12 PM)',   enrolledOn: new Date('2026-07-11'), status: 'active' },
      { student: arun._id,    course: react._id,     batch: 'Evening Batch (6 PM - 8 PM)',     enrolledOn: new Date('2026-06-30'), status: 'completed' }
    ]);
  }

  console.log('\nSample data loaded successfully!\n');
  console.log('Login credentials (password for every account: ' + DEFAULT_PASSWORD + ')');
  console.log('  Student : kabilan@student.edu');
  console.log('  Student : divya@student.edu');
  console.log('  Student : arun@student.edu');
  console.log('  Admin   : hariharan@thiranex.in');
  console.log('  Admin   : priya@thiranex.in\n');

  try { await mongoose.disconnect(); } catch (e) {}
  process.exit(0);
};

run().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  try { await mongoose.disconnect(); } catch (e) { /* ignore */ }
  process.exit(1);
});
