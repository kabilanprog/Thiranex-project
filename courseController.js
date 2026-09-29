const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Public: list all courses
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: 1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// Public: single course
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    next(error);
  }
};

// Admin: add a course
exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, category, instructor, duration, seatsAvailable } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Course title is required' });
    }
    const course = await Course.create({
      title, description, category, instructor, duration, seatsAvailable
    });
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

// Admin: update a course
exports.updateCourse = async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'category', 'instructor', 'duration', 'seatsAvailable'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (updates.title !== undefined && !String(updates.title).trim()) {
      return res.status(400).json({ message: 'Course title is required' });
    }
    const course = await Course.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    next(error);
  }
};

// Admin: delete a course (and its enrollments)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    await Enrollment.deleteMany({ course: course._id });
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};
