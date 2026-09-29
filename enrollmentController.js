const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Student: enroll into a course
exports.enroll = async (req, res, next) => {
  try {
    const { courseId, batch } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const already = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (already) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Atomically reserve one seat (prevents over-booking when two students enroll together)
    const reserved = await Course.findOneAndUpdate(
      { _id: courseId, seatsAvailable: { $gt: 0 } },
      { $inc: { seatsAvailable: -1 } },
      { new: true }
    );
    if (!reserved) {
      return res.status(400).json({ message: 'No seats available' });
    }

    try {
      const enrollment = new Enrollment({ student: req.user.id, course: courseId, batch });
      await enrollment.save();
      res.status(201).json(enrollment);
    } catch (saveError) {
      // Roll the seat back if the enrollment could not be saved
      await Course.findByIdAndUpdate(courseId, { $inc: { seatsAvailable: 1 } });
      throw saveError;
    }
  } catch (error) {
    next(error);
  }
};

// Student: enrollments of the logged-in student
exports.myEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id }).populate('course');
    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

// Admin: all enrollments
exports.allEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('student', 'name email')
      .populate('course', 'title duration')
      .sort({ enrolledOn: -1 });
    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

// Admin: change enrollment status (active / completed)
exports.updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or completed' });
    }
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json(enrollment);
  } catch (error) {
    next(error);
  }
};

// Admin: cancel an enrollment and give the seat back
exports.deleteEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    await Course.findByIdAndUpdate(enrollment.course, { $inc: { seatsAvailable: 1 } });
    res.json({ message: 'Enrollment cancelled' });
  } catch (error) {
    next(error);
  }
};
