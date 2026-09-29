/* ==========================================================
   Online Course Enrollment System (Mini LMS) - Front-end logic
   Pages: login.html, dashboard.html, courses.html, enroll.html
   ========================================================== */

// When the pages are opened from the same Express server (port 5000), API_BASE stays empty.
// If opened directly from disk (file://) or via VS Code Live Server (port 5500, etc.), point to http://localhost:5000.
const API_BASE = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000'))
  ? 'http://localhost:5000'
  : '';

/* ---------- Session helpers ---------- */
const Auth = {
  get token() { return localStorage.getItem('lms_token'); },
  get user() {
    try { return JSON.parse(localStorage.getItem('lms_user')); } catch (e) { return null; }
  },
  save(token, user) {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  }
};

function esc(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function fmtDate(value) {
  const d = new Date(value);
  return isNaN(d) ? '-' : d.toISOString().slice(0, 10);
}

function showMessage(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = 'alert-box show ' + (type || 'error');
}

function hideMessage(el) {
  if (el) el.className = 'alert-box';
}

/* ---------- API wrapper ---------- */
async function api(path, options = {}) {
  const { method = 'GET', body, auth = true } = options;
  const headers = { 'Content-Type': 'application/json' };
  if (auth && Auth.token) headers.Authorization = 'Bearer ' + Auth.token;

  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    throw new Error('Cannot reach the server. Please make sure the back-end is running.');
  }

  let data = null;
  try { data = await res.json(); } catch (e) { /* empty body */ }

  if (!res.ok) {
    // Token expired / invalid -> back to login
    if (res.status === 401 && auth && Auth.token) {
      Auth.clear();
      window.location.href = 'login.html';
    }
    throw new Error((data && data.message) || 'Request failed (' + res.status + ')');
  }
  return data;
}

/* ---------- Common page pieces ---------- */
function requireLogin() {
  if (!Auth.token || !Auth.user) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  Auth.clear();
  window.location.href = 'login.html';
}

function renderHeader() {
  const el = document.getElementById('app-header');
  if (!el) return;
  const page = document.body.dataset.page;
  const cls = (name) => (page === name ? 'active' : '');

  let right;
  if (Auth.user) {
    right = `
      <nav class="nav-links">
        <a href="dashboard.html" class="${cls('dashboard')}">Dashboard</a>
        <a href="courses.html" class="${cls('courses')}">Courses</a>
        <a href="enroll.html" class="${cls('enroll')}">Enroll</a>
      </nav>
      <button class="btn" id="logout-btn" type="button">Logout</button>`;
  } else {
    right = '<a class="btn" href="login.html">Login</a>';
  }
  el.innerHTML = `<a class="brand" href="dashboard.html">Online Course Enrollment System</a>
                  <div class="header-right">${right}</div>`;
  const btn = document.getElementById('logout-btn');
  if (btn) btn.addEventListener('click', logout);
}

/* ==========================================================
   LOGIN / REGISTER PAGE
   ========================================================== */
function initLogin() {
  if (Auth.token && Auth.user) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('auth-form');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const nameGroup = document.getElementById('name-group');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const submitBtn = document.getElementById('auth-submit');
  const switchText = document.getElementById('auth-switch');
  const msg = document.getElementById('msg');
  let mode = 'login';

  function setMode(next) {
    mode = next;
    hideMessage(msg);
    if (mode === 'login') {
      title.textContent = 'Welcome Back';
      subtitle.textContent = 'Sign in to your student account';
      nameGroup.style.display = 'none';
      nameInput.required = false;
      submitBtn.textContent = 'Log In';
      switchText.innerHTML = 'Don\'t have an account? <a href="#" id="switch-link">Register</a>';
    } else {
      title.textContent = 'Create Account';
      subtitle.textContent = 'Register as a new student';
      nameGroup.style.display = 'block';
      nameInput.required = true;
      submitBtn.textContent = 'Register';
      switchText.innerHTML = 'Already have an account? <a href="#" id="switch-link">Log In</a>';
    }
    document.getElementById('switch-link').addEventListener('click', (e) => {
      e.preventDefault();
      setMode(mode === 'login' ? 'register' : 'login');
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage(msg);

    const email = emailInput.value.trim();
    const password = passInput.value;
    const name = nameInput.value.trim();

    // Client-side validation
    if (!email || !password || (mode === 'register' && !name)) {
      showMessage(msg, 'Please fill in all the fields.');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      showMessage(msg, 'Password must be at least 6 characters.');
      return;
    }

    submitBtn.disabled = true;
    try {
      if (mode === 'login') {
        const data = await api('/api/auth/login', { method: 'POST', body: { email, password }, auth: false });
        Auth.save(data.token, data.user);
        window.location.href = 'dashboard.html';
      } else {
        await api('/api/auth/register', { method: 'POST', body: { name, email, password }, auth: false });
        setMode('login');
        passInput.value = '';
        showMessage(msg, 'Registration successful! Please log in.', 'success');
      }
    } catch (err) {
      showMessage(msg, err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });

  setMode('login');
}

/* ==========================================================
   DASHBOARD PAGE  (student table + admin panel)
   ========================================================== */
async function initDashboard() {
  if (!requireLogin()) return;
  renderHeader();

  const user = Auth.user;
  const isAdmin = user.role === 'admin';
  const root = document.getElementById('dashboard-root');
  root.innerHTML = `<h1 class="page-title">Welcome, ${esc(user.name)} — ${isAdmin ? 'Admin' : 'Student'} Dashboard</h1>
                    <div id="msg" class="alert-box"></div>
                    <div id="dash-content"></div>`;
  const msg = document.getElementById('msg');
  const content = document.getElementById('dash-content');

  try {
    if (isAdmin) {
      await renderAdmin(content, msg);
    } else {
      await renderStudent(content);
    }
  } catch (err) {
    showMessage(msg, err.message);
  }
}

async function renderStudent(content) {
  const [courses, mine] = await Promise.all([
    api('/api/courses', { auth: false }),
    api('/api/my-enrollments')
  ]);

  const statusByCourse = {};
  mine.forEach((en) => { if (en.course) statusByCourse[en.course._id] = en.status; });

  const rows = courses.map((c) => {
    const st = statusByCourse[c._id];
    let cell = '<span class="status-not">Not Enrolled</span>';
    if (st === 'active') cell = '<span class="status-enrolled">Enrolled</span>';
    if (st === 'completed') cell = '<span class="status-done">Completed</span>';
    return `<tr>
      <td>${esc(c.title)}</td>
      <td>${esc(c.instructor)}</td>
      <td>${esc(c.duration)}</td>
      <td>${esc(c.seatsAvailable)}</td>
      <td>${cell}</td>
    </tr>`;
  }).join('');

  content.innerHTML = `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>Course</th><th>Instructor</th><th>Duration</th><th>Seats Left</th><th>Status</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" class="empty-row">No courses available yet.</td></tr>'}</tbody>
  </table></div>`;
}

async function renderAdmin(content, msg) {
  let editingId = null;

  content.innerHTML = `
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Course</th><th>Instructor</th><th>Duration</th><th>Seats Left</th><th>Actions</th></tr></thead>
      <tbody id="admin-courses"></tbody>
    </table></div>

    <h2 class="section-title" id="form-title">Add a New Course</h2>
    <div class="card-box admin-form">
      <div class="form-row">
        <div class="form-group"><label for="c-title">Course Title</label><input class="form-control" id="c-title" type="text"></div>
        <div class="form-group"><label for="c-category">Category</label><input class="form-control" id="c-category" type="text" placeholder="Web Dev, Database..."></div>
        <div class="form-group"><label for="c-instructor">Instructor</label><input class="form-control" id="c-instructor" type="text"></div>
        <div class="form-group"><label for="c-duration">Duration</label><input class="form-control" id="c-duration" type="text" placeholder="4 Weeks"></div>
        <div class="form-group"><label for="c-seats">Seats Available</label><input class="form-control" id="c-seats" type="number" min="0" value="30"></div>
        <div class="form-group wide"><label for="c-desc">Description</label><textarea class="form-control" id="c-desc"></textarea></div>
      </div>
      <div class="form-actions">
        <button class="btn" id="save-course" type="button">Add Course</button>
        <button class="btn btn-ghost" id="cancel-edit" type="button" style="display:none">Cancel</button>
      </div>
    </div>

    <h2 class="section-title">Student Enrollments</h2>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Student</th><th>Email</th><th>Course</th><th>Batch</th><th>Enrolled On</th><th>Status</th><th>Action</th></tr></thead>
      <tbody id="admin-enrollments"></tbody>
    </table></div>`;

  const $ = (id) => document.getElementById(id);
  let courses = [];

  async function loadCourses() {
    courses = await api('/api/courses', { auth: false });
    $('admin-courses').innerHTML = courses.map((c) => `<tr>
        <td>${esc(c.title)}</td>
        <td>${esc(c.instructor)}</td>
        <td>${esc(c.duration)}</td>
        <td>${esc(c.seatsAvailable)}</td>
        <td><div class="actions">
          <button class="btn btn-sm" data-edit="${esc(c._id)}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger" data-del="${esc(c._id)}" type="button">Delete</button>
        </div></td>
      </tr>`).join('') || '<tr><td colspan="5" class="empty-row">No courses yet. Add one below.</td></tr>';
  }

  async function loadEnrollments() {
    const list = await api('/api/admin/enrollments');
    $('admin-enrollments').innerHTML = list.map((en) => `<tr>
        <td>${esc(en.student ? en.student.name : '(deleted user)')}</td>
        <td>${esc(en.student ? en.student.email : '-')}</td>
        <td>${esc(en.course ? en.course.title : '(deleted course)')}</td>
        <td>${esc(en.batch)}</td>
        <td>${fmtDate(en.enrolledOn)}</td>
        <td><select class="form-control" data-status="${esc(en._id)}">
          <option value="active" ${en.status === 'active' ? 'selected' : ''}>active</option>
          <option value="completed" ${en.status === 'completed' ? 'selected' : ''}>completed</option>
        </select></td>
        <td><button class="btn btn-sm btn-danger" data-cancel="${esc(en._id)}" type="button">Cancel</button></td>
      </tr>`).join('') || '<tr><td colspan="7" class="empty-row">No enrollments yet.</td></tr>';
  }

  function resetForm() {
    editingId = null;
    ['c-title', 'c-category', 'c-instructor', 'c-duration', 'c-desc'].forEach((id) => { $(id).value = ''; });
    $('c-seats').value = 30;
    $('form-title').textContent = 'Add a New Course';
    $('save-course').textContent = 'Add Course';
    $('cancel-edit').style.display = 'none';
  }

  $('save-course').addEventListener('click', async () => {
    hideMessage(msg);
    const payload = {
      title: $('c-title').value.trim(),
      category: $('c-category').value.trim() || 'General',
      instructor: $('c-instructor').value.trim() || 'To be announced',
      duration: $('c-duration').value.trim(),
      seatsAvailable: Number($('c-seats').value),
      description: $('c-desc').value.trim()
    };
    if (!payload.title) { showMessage(msg, 'Course title is required.'); return; }
    if (isNaN(payload.seatsAvailable) || payload.seatsAvailable < 0) { showMessage(msg, 'Seats must be 0 or more.'); return; }

    try {
      if (editingId) {
        await api('/api/admin/courses/' + editingId, { method: 'PUT', body: payload });
        showMessage(msg, 'Course updated successfully.', 'success');
      } else {
        await api('/api/admin/courses', { method: 'POST', body: payload });
        showMessage(msg, 'Course added successfully.', 'success');
      }
      resetForm();
      await loadCourses();
    } catch (err) { showMessage(msg, err.message); }
  });

  $('cancel-edit').addEventListener('click', resetForm);

  $('admin-courses').addEventListener('click', async (e) => {
    const editId = e.target.dataset.edit;
    const delId = e.target.dataset.del;
    if (editId) {
      const c = courses.find((x) => x._id === editId);
      if (!c) return;
      editingId = c._id;
      $('c-title').value = c.title || '';
      $('c-category').value = c.category || '';
      $('c-instructor').value = c.instructor || '';
      $('c-duration').value = c.duration || '';
      $('c-seats').value = c.seatsAvailable;
      $('c-desc').value = c.description || '';
      $('form-title').textContent = 'Update Course';
      $('save-course').textContent = 'Update Course';
      $('cancel-edit').style.display = 'inline-block';
      $('form-title').scrollIntoView({ behavior: 'smooth' });
    }
    if (delId && confirm('Delete this course and all its enrollments?')) {
      try {
        await api('/api/admin/courses/' + delId, { method: 'DELETE' });
        showMessage(msg, 'Course deleted successfully.', 'success');
        await Promise.all([loadCourses(), loadEnrollments()]);
      } catch (err) { showMessage(msg, err.message); }
    }
  });

  $('admin-enrollments').addEventListener('change', async (e) => {
    const id = e.target.dataset.status;
    if (!id) return;
    try {
      await api('/api/admin/enrollments/' + id, { method: 'PUT', body: { status: e.target.value } });
      showMessage(msg, 'Enrollment status updated.', 'success');
    } catch (err) { showMessage(msg, err.message); }
  });

  $('admin-enrollments').addEventListener('click', async (e) => {
    const id = e.target.dataset.cancel;
    if (id && confirm('Cancel this enrollment? The seat will be given back.')) {
      try {
        await api('/api/admin/enrollments/' + id, { method: 'DELETE' });
        showMessage(msg, 'Enrollment cancelled.', 'success');
        await Promise.all([loadCourses(), loadEnrollments()]);
      } catch (err) { showMessage(msg, err.message); }
    }
  });

  await Promise.all([loadCourses(), loadEnrollments()]);
}

/* ==========================================================
   COURSE LISTING PAGE
   ========================================================== */
async function initCourses() {
  renderHeader();
  const list = document.getElementById('course-list');
  const msg = document.getElementById('msg');

  try {
    const courses = await api('/api/courses', { auth: false });
    let enrolled = {};
    if (Auth.token) {
      try {
        const mine = await api('/api/my-enrollments');
        mine.forEach((en) => { if (en.course) enrolled[en.course._id] = true; });
      } catch (e) { /* ignore - list still works */ }
    }

    if (!courses.length) {
      list.innerHTML = '<div class="course-card"><p>No courses available yet.</p></div>';
      return;
    }

    list.innerHTML = courses.map((c) => {
      let button = `<a class="btn" href="enroll.html?course=${encodeURIComponent(c._id)}">Enroll Now</a>`;
      if (enrolled[c._id]) button = '<button class="btn" disabled type="button">Already Enrolled</button>';
      else if (c.seatsAvailable <= 0) button = '<button class="btn" disabled type="button">Seats Full</button>';
      return `<div class="course-card">
        <span class="tag">${esc(c.category)}</span>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.description)}</p>
        ${button}
      </div>`;
    }).join('');
  } catch (err) {
    showMessage(msg, err.message);
  }
}

/* ==========================================================
   ENROLLMENT PAGE
   ========================================================== */
async function initEnroll() {
  if (!requireLogin()) return;
  renderHeader();

  const msg = document.getElementById('msg');
  const nameInput = document.getElementById('student-name');
  const courseSel = document.getElementById('course-select');
  const batchSel = document.getElementById('batch-select');
  const info = document.getElementById('info-bar');
  const form = document.getElementById('enroll-form');
  const btn = document.getElementById('enroll-btn');

  nameInput.value = Auth.user.name;

  let courses = [];
  try {
    courses = await api('/api/courses', { auth: false });
  } catch (err) {
    showMessage(msg, err.message);
    return;
  }

  courseSel.innerHTML = courses.map((c) => `<option value="${esc(c._id)}">${esc(c.title)}</option>`).join('');
  const wanted = new URLSearchParams(window.location.search).get('course');
  if (wanted && courses.some((c) => c._id === wanted)) courseSel.value = wanted;

  function updateInfo() {
    const c = courses.find((x) => x._id === courseSel.value);
    if (!c) { info.textContent = 'No courses available'; btn.disabled = true; return; }
    info.textContent = `Seats available: ${c.seatsAvailable}  |  Duration: ${c.duration || '-'}`;
    btn.disabled = c.seatsAvailable <= 0;
  }
  courseSel.addEventListener('change', updateInfo);
  updateInfo();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage(msg);
    if (!courseSel.value) { showMessage(msg, 'Please select a course.'); return; }

    btn.disabled = true;
    try {
      await api('/api/enroll', { method: 'POST', body: { courseId: courseSel.value, batch: batchSel.value } });
      showMessage(msg, 'Enrollment confirmed! Redirecting to your dashboard...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1300);
    } catch (err) {
      showMessage(msg, err.message);
      btn.disabled = false;
    }
  });
}

/* ---------- Page router ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'login') initLogin();
  else if (page === 'dashboard') initDashboard();
  else if (page === 'courses') initCourses();
  else if (page === 'enroll') initEnroll();
});
