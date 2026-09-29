const express = require('express');
const router = express.Router();
const { enroll, myEnrollments } = require('../controllers/enrollmentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Enroll into a course
router.post('/enroll', authMiddleware, enroll);

// Get enrollments for the logged-in student
router.get('/my-enrollments', authMiddleware, myEnrollments);

module.exports = router;
