const mongoose = require('mongoose');
const { initLocalStore } = require('./localStore');

mongoose.set('strictQuery', true);

let isUsingLocalStore = false;

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('No MONGO_URI specified');
    }
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000
    });
    isUsingLocalStore = false;
    console.log('MongoDB connected successfully');
  } catch (error) {
    isUsingLocalStore = true;
    initLocalStore();
    console.log('\n======================================================');
    console.log('[INFO] MongoDB server not found on port 27017.');
    console.log('[INFO] Built-in local database engine ACTIVATED.');
    console.log('[INFO] All data is saved automatically to backend/data/lms_store.json');
    console.log('======================================================\n');
  }
};

const isLocalDB = () => isUsingLocalStore || mongoose.connection.readyState !== 1;

module.exports = connectDB;
module.exports.isLocalDB = isLocalDB;

