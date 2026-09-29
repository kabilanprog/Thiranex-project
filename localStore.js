const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'lms_store.json');

let store = {
  users: [],
  courses: [],
  enrollments: []
};

let isInitialized = false;

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadStore() {
  ensureDataDir();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      store = JSON.parse(content);
      if (!store.users) store.users = [];
      if (!store.courses) store.courses = [];
      if (!store.enrollments) store.enrollments = [];
      isInitialized = true;
      return;
    } catch (e) {
      console.warn('Could not read lms_store.json, creating new default store.');
    }
  }
  seedDefaultData();
}

function saveStore() {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database to file:', err.message);
  }
}

function seedDefaultData() {
  const hash = bcrypt.hashSync('Pass1234', 10);

  const kabilanId = generateId();
  const hariharanId = generateId();
  const divyaId = generateId();
  const arunId = generateId();
  const priyaId = generateId();

  const fullStackId = generateId();
  const sqlId = generateId();
  const reactId = generateId();
  const nodeId = generateId();
  const mongoId = generateId();
  const gitId = generateId();

  store.users = [
    { _id: kabilanId, name: 'Kabilan S', email: 'kabilan@student.edu', password: hash, role: 'student', createdAt: new Date('2026-07-08').toISOString() },
    { _id: hariharanId, name: 'Hariharan M', email: 'hariharan@thiranex.in', password: hash, role: 'admin', createdAt: new Date('2026-06-01').toISOString() },
    { _id: divyaId, name: 'Divya S', email: 'divya@student.edu', password: hash, role: 'student', createdAt: new Date('2026-07-09').toISOString() },
    { _id: arunId, name: 'Arun K', email: 'arun@student.edu', password: hash, role: 'student', createdAt: new Date('2026-07-10').toISOString() },
    { _id: priyaId, name: 'Priya R', email: 'priya@thiranex.in', password: hash, role: 'admin', createdAt: new Date('2026-06-02').toISOString() }
  ];

  store.courses = [
    {
      _id: fullStackId,
      title: 'Full Stack Web Development', category: 'Web Dev', instructor: 'Mr. Hariharan M',
      duration: '4 Weeks', seatsAvailable: 12,
      description: 'HTML, CSS, JS, Node.js, Express, MongoDB — build complete web apps end to end.',
      createdAt: new Date('2026-07-01').toISOString()
    },
    {
      _id: sqlId,
      title: 'Database Management (SQL)', category: 'Database', instructor: 'Ms. Priya R',
      duration: '3 Weeks', seatsAvailable: 18,
      description: 'Learn relational database design, SQL queries and stored procedures.',
      createdAt: new Date('2026-07-02').toISOString()
    },
    {
      _id: reactId,
      title: 'React JS Fundamentals', category: 'Frontend', instructor: 'Mr. Arun K',
      duration: '2 Weeks', seatsAvailable: 25,
      description: 'Component-based UI development using modern React practices.',
      createdAt: new Date('2026-07-03').toISOString()
    },
    {
      _id: nodeId,
      title: 'Node.js & Express Basics', category: 'Backend', instructor: 'Mr. Hariharan M',
      duration: '3 Weeks', seatsAvailable: 9,
      description: 'Build REST APIs and server-side logic using Node.js and Express.',
      createdAt: new Date('2026-07-04').toISOString()
    },
    {
      _id: mongoId,
      title: 'MongoDB Essentials', category: 'Database', instructor: 'Ms. Divya S',
      duration: '2 Weeks', seatsAvailable: 20,
      description: 'NoSQL database design, schemas and integration with Node.js apps.',
      createdAt: new Date('2026-07-05').toISOString()
    },
    {
      _id: gitId,
      title: 'Git & GitHub Basics', category: 'Tools', instructor: 'Mr. Arun K',
      duration: '1 Week', seatsAvailable: 30,
      description: 'Version control, branching, and collaboration workflow for developers.',
      createdAt: new Date('2026-07-06').toISOString()
    }
  ];

  store.enrollments = [
    { _id: generateId(), student: kabilanId, course: fullStackId, batch: 'Morning Batch (10 AM - 12 PM)', enrolledOn: new Date('2026-07-09').toISOString(), status: 'active' },
    { _id: generateId(), student: kabilanId, course: nodeId, batch: 'Afternoon Batch (2 PM - 4 PM)', enrolledOn: new Date('2026-07-15').toISOString(), status: 'active' },
    { _id: generateId(), student: divyaId, course: mongoId, batch: 'Morning Batch (10 AM - 12 PM)', enrolledOn: new Date('2026-07-11').toISOString(), status: 'active' },
    { _id: generateId(), student: arunId, course: reactId, batch: 'Evening Batch (6 PM - 8 PM)', enrolledOn: new Date('2026-06-30').toISOString(), status: 'completed' }
  ];

  isInitialized = true;
  saveStore();
}

function initLocalStore() {
  if (!isInitialized) {
    loadStore();
  }
}

// Helper to match queries like { email: '...' }, { _id: '...', seatsAvailable: { $gt: 0 } }
function matchesQuery(item, query = {}) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, val] of Object.entries(query)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (val.$gt !== undefined) {
        if (!(item[key] > val.$gt)) return false;
      }
      if (val.$gte !== undefined) {
        if (!(item[key] >= val.$gte)) return false;
      }
      if (val.$lt !== undefined) {
        if (!(item[key] < val.$lt)) return false;
      }
      if (val.$lte !== undefined) {
        if (!(item[key] <= val.$lte)) return false;
      }
      if (val.$ne !== undefined) {
        if (item[key] === val.$ne) return false;
      }
    } else {
      const itemVal = item[key] !== undefined && item[key] !== null ? String(item[key]) : '';
      const queryVal = val !== undefined && val !== null ? String(val) : '';
      if (itemVal.toLowerCase() !== queryVal.toLowerCase()) return false;
    }
  }
  return true;
}

function applyPopulate(doc, populates) {
  if (!doc) return doc;
  const clone = JSON.parse(JSON.stringify(doc));
  for (const { path: field, select } of populates) {
    if (field === 'student' && clone.student) {
      const studentId = typeof clone.student === 'object' ? clone.student._id : clone.student;
      const u = store.users.find(x => String(x._id) === String(studentId));
      if (u) {
        if (select) {
          const fields = select.split(' ').filter(Boolean);
          const selObj = { _id: u._id };
          fields.forEach(f => { if (u[f] !== undefined) selObj[f] = u[f]; });
          clone.student = selObj;
        } else {
          clone.student = JSON.parse(JSON.stringify(u));
        }
      }
    } else if (field === 'course' && clone.course) {
      const courseId = typeof clone.course === 'object' ? clone.course._id : clone.course;
      const c = store.courses.find(x => String(x._id) === String(courseId));
      if (c) {
        if (select) {
          const fields = select.split(' ').filter(Boolean);
          const selObj = { _id: c._id };
          fields.forEach(f => { if (c[f] !== undefined) selObj[f] = c[f]; });
          clone.course = selObj;
        } else {
          clone.course = JSON.parse(JSON.stringify(c));
        }
      }
    }
  }
  return clone;
}

class QueryBuilder {
  constructor(collectionName, query = {}, isSingle = false) {
    this.collectionName = collectionName;
    this.query = query;
    this.isSingle = isSingle;
    this.populates = [];
    this.sortCriteria = null;
  }

  populate(field, select) {
    this.populates.push({ path: field, select });
    return this;
  }

  sort(criteria) {
    this.sortCriteria = criteria;
    return this;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }

  async exec() {
    initLocalStore();
    const items = store[this.collectionName] || [];
    let matched = items.filter(item => matchesQuery(item, this.query));

    if (this.sortCriteria) {
      const entries = Object.entries(this.sortCriteria);
      matched.sort((a, b) => {
        for (const [key, direction] of entries) {
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return direction === -1 ? 1 : -1;
          if (valA > valB) return direction === -1 ? -1 : 1;
        }
        return 0;
      });
    }

    if (this.isSingle) {
      const single = matched[0] ? applyPopulate(matched[0], this.populates) : null;
      return single;
    }

    return matched.map(item => applyPopulate(item, this.populates));
  }
}

function createModel(collectionName, schemaDefaults = {}) {
  class ModelInstance {
    constructor(data = {}) {
      Object.assign(this, schemaDefaults, data);
      if (!this._id) this._id = generateId();
      if (!this.createdAt) this.createdAt = new Date().toISOString();
      if (!this.updatedAt) this.updatedAt = new Date().toISOString();
    }

    async save() {
      initLocalStore();
      const items = store[collectionName];
      const idx = items.findIndex(x => String(x._id) === String(this._id));
      this.updatedAt = new Date().toISOString();
      const plain = JSON.parse(JSON.stringify(this));
      if (idx >= 0) {
        items[idx] = plain;
      } else {
        items.push(plain);
      }
      saveStore();
      return this;
    }
  }

  ModelInstance.collectionName = collectionName;

  ModelInstance.find = function (query = {}) {
    return new QueryBuilder(collectionName, query, false);
  };

  ModelInstance.findOne = function (query = {}) {
    return new QueryBuilder(collectionName, query, true);
  };

  ModelInstance.findById = function (id) {
    return new QueryBuilder(collectionName, { _id: id }, true);
  };

  ModelInstance.create = async function (data) {
    const inst = new ModelInstance(data);
    await inst.save();
    return inst;
  };

  ModelInstance.insertMany = async function (docs) {
    initLocalStore();
    const created = [];
    for (const doc of docs) {
      const inst = new ModelInstance(doc);
      created.push(JSON.parse(JSON.stringify(inst)));
    }
    store[collectionName].push(...created);
    saveStore();
    return created;
  };

  ModelInstance.findByIdAndUpdate = async function (id, updates = {}, options = {}) {
    initLocalStore();
    const items = store[collectionName];
    const idx = items.findIndex(x => String(x._id) === String(id));
    if (idx < 0) return null;

    const item = items[idx];
    if (updates.$inc) {
      for (const [k, v] of Object.entries(updates.$inc)) {
        item[k] = (Number(item[k]) || 0) + Number(v);
      }
    }
    for (const [k, v] of Object.entries(updates)) {
      if (k !== '$inc' && k !== '$set') {
        item[k] = v;
      } else if (k === '$set') {
        Object.assign(item, v);
      }
    }
    item.updatedAt = new Date().toISOString();
    saveStore();
    return JSON.parse(JSON.stringify(item));
  };

  ModelInstance.findOneAndUpdate = async function (query = {}, updates = {}, options = {}) {
    initLocalStore();
    const items = store[collectionName];
    const item = items.find(x => matchesQuery(x, query));
    if (!item) return null;

    if (updates.$inc) {
      for (const [k, v] of Object.entries(updates.$inc)) {
        item[k] = (Number(item[k]) || 0) + Number(v);
      }
    }
    for (const [k, v] of Object.entries(updates)) {
      if (k !== '$inc' && k !== '$set') {
        item[k] = v;
      } else if (k === '$set') {
        Object.assign(item, v);
      }
    }
    item.updatedAt = new Date().toISOString();
    saveStore();
    return JSON.parse(JSON.stringify(item));
  };

  ModelInstance.findByIdAndDelete = async function (id) {
    initLocalStore();
    const items = store[collectionName];
    const idx = items.findIndex(x => String(x._id) === String(id));
    if (idx < 0) return null;
    const removed = items.splice(idx, 1)[0];
    saveStore();
    return removed;
  };

  ModelInstance.deleteMany = async function (query = {}) {
    initLocalStore();
    if (!query || Object.keys(query).length === 0) {
      const count = store[collectionName].length;
      store[collectionName] = [];
      saveStore();
      return { deletedCount: count };
    }
    const before = store[collectionName].length;
    store[collectionName] = store[collectionName].filter(x => !matchesQuery(x, query));
    saveStore();
    return { deletedCount: before - store[collectionName].length };
  };

  ModelInstance.syncIndexes = async function () {
    return true;
  };

  return ModelInstance;
}

const LocalUser = createModel('users', { role: 'student' });
const LocalCourse = createModel('courses', { category: 'General', seatsAvailable: 30 });
const LocalEnrollment = createModel('enrollments', { batch: 'Morning Batch (10 AM - 12 PM)', status: 'active' });

module.exports = {
  initLocalStore,
  seedDefaultData,
  LocalUser,
  LocalCourse,
  LocalEnrollment
};
