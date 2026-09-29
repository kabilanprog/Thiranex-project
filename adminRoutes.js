const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const {
  createCourse, updateCourse, deleteCourse
} = require('../controllers/courseController');
const {
  allEnrollments, updateEnrollmentStatus, deleteEnrollment
} = require('../controllers/enrollmentController');

// Every admin route needs a valid token AND the admin role
router.use(authMiddleware, adminOnly);

// Course management
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Enrollment management
router.get('/enrollments', allEnrollments);
router.put('/enrollments/:id', updateEnrollmentStatus);
router.delete('/enrollments/:id', deleteEnrollment);

module.exports = router;
