const express = require('express');
const router = express.Router();
const { getCourses, getCourseById } = require('../controllers/courseController');

// Public routes - courses can be viewed without logging in
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);

module.exports = router;
