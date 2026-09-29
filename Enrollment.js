const mongoose = require('mongoose');
const { isLocalDB } = require('../config/db');
const { LocalEnrollment } = require('../config/localStore');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  batch: { type: String, default: 'Morning Batch (10 AM - 12 PM)' },
  enrolledOn: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
});

// A student can enrol in a given course only once
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const MongooseEnrollment = mongoose.model('Enrollment', enrollmentSchema);

const EnrollmentProxy = new Proxy(MongooseEnrollment, {
  construct(target, args) {
    if (isLocalDB()) {
      return new LocalEnrollment(...args);
    }
    return new target(...args);
  },
  get(target, prop) {
    if (isLocalDB()) {
      if (prop in LocalEnrollment) {
        return typeof LocalEnrollment[prop] === 'function' ? LocalEnrollment[prop].bind(LocalEnrollment) : LocalEnrollment[prop];
      }
    }
    const val = target[prop];
    return typeof val === 'function' ? val.bind(target) : val;
  }
});

module.exports = EnrollmentProxy;
