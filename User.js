const mongoose = require('mongoose');
const { isLocalDB } = require('../config/db');
const { LocalUser } = require('../config/localStore');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

const MongooseUser = mongoose.model('User', userSchema);

const UserProxy = new Proxy(MongooseUser, {
  construct(target, args) {
    if (isLocalDB()) {
      return new LocalUser(...args);
    }
    return new target(...args);
  },
  get(target, prop) {
    if (isLocalDB()) {
      if (prop in LocalUser) {
        return typeof LocalUser[prop] === 'function' ? LocalUser[prop].bind(LocalUser) : LocalUser[prop];
      }
    }
    const val = target[prop];
    return typeof val === 'function' ? val.bind(target) : val;
  }
});

module.exports = UserProxy;
