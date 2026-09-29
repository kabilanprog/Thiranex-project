const mongoose = require('mongoose');
const { isLocalDB } = require('../config/db');
const { LocalCourse } = require('../config/localStore');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  category: { type: String, default: 'General' },
  instructor: { type: String, default: 'To be announced' },
  duration: { type: String },
  seatsAvailable: { type: Number, default: 30, min: 0 }
}, { timestamps: true });

const MongooseCourse = mongoose.model('Course', courseSchema);

const CourseProxy = new Proxy(MongooseCourse, {
  construct(target, args) {
    if (isLocalDB()) {
      return new LocalCourse(...args);
    }
    return new target(...args);
  },
  get(target, prop) {
    if (isLocalDB()) {
      if (prop in LocalCourse) {
        return typeof LocalCourse[prop] === 'function' ? LocalCourse[prop].bind(LocalCourse) : LocalCourse[prop];
      }
    }
    const val = target[prop];
    return typeof val === 'function' ? val.bind(target) : val;
  }
});

module.exports = CourseProxy;
