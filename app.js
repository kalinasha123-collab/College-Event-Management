/**
 * app.js – Main logic, routing, floating leaves & scroll animations
 */
const App = {
  currentPage: 'home',
  deleteTargetId: null,
  observer: null,

  init() {
    Storage.seedIfEmpty();
    this.createLeaves();
    this.bindNav();
    this.bindModal();
    this.setupScrollReveal();
    this.render();
  },

  /* ===== Floating Leaves ===== */
  createLeaves() {
    const container = document.getElementById('leavesContainer');
    if (!container) return;
    const leafEmojis = ['🍃', '🌿', '🍂', '☘️'];
    const count = 14;

    for (let i = 0; i < count; i++) {
      const leaf = document.createElement('span');
      leaf.className = 'leaf';
      leaf.textContent = leafEmojis[i % leafEmojis.length];
      leaf.style.left = Math.random() * 100 + 'vw';
      leaf.style.fontSize = (1.1 + Math.random() * 1.3) + 'rem';
      leaf.style.animationDuration = (12 + Math.random() * 18) + 's';
      leaf.style.animationDelay = (Math.random() * 10) + 's';
      leaf.style.opacity = 0.25 + Math.random() * 0.35;
      container.appendChild(leaf);
    }
  },

  /* ===== Scroll Reveal ===== */
  setupScrollReveal() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  },

  observeReveals() {
    if (!this.observer) return;
    document.querySelectorAll('.reveal').forEach(el => {
      this.observer.unobserve(el);
      this.observer.observe(el);
    });
  },

  bindNav() {
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(link.dataset.page);
        document.getElementById('navLinks').classList.remove('open');
        document.getElementById('navToggle')?.setAttribute('aria-expanded', 'false');
      });
    });

    const toggle = document.getElementById('navToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const links = document.getElementById('navLinks');
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      this.closeModal();
      this.closeConfirm();
      document.getElementById('navLinks').classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  },

  bindModal() {
    const modal = document.getElementById('eventModal');
    const confirmModal = document.getElementById('confirmModal');

    document.getElementById('modalClose').onclick = () => this.closeModal();
    document.getElementById('cancelBtn').onclick = () => this.closeModal();
    document.getElementById('confirmClose').onclick = () => this.closeConfirm();
    document.getElementById('confirmCancel').onclick = () => this.closeConfirm();

    document.getElementById('eventForm').onsubmit = (e) => {
      e.preventDefault();
      this.saveEvent();
    };

    document.getElementById('confirmDelete').onclick = () => {
      if (this.deleteTargetId) {
        EventService.delete(this.deleteTargetId);
        this.showToast('Event deleted successfully', 'success');
        this.closeConfirm();
        this.render();
      }
    };

    modal.onclick = (e) => { if (e.target === modal) this.closeModal(); };
    confirmModal.onclick = (e) => { if (e.target === confirmModal) this.closeConfirm(); };
  },

  navigate(page) {
    this.currentPage = page;
    document.querySelectorAll('[data-page]').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });
    this.render();
  },

  render() {
    const app = document.getElementById('app');
    switch (this.currentPage) {
      case 'home':
        app.innerHTML = this.renderHome();
        break;
      case 'about':
        app.innerHTML = this.renderAbout();
        break;
      case 'events':
        app.innerHTML = this.renderEvents();
        this.bindEventFilters();
        break;
      case 'manage':
        app.innerHTML = this.renderManage();
        this.bindManageActions();
        break;
      default:
        app.innerHTML = this.renderHome();
    }
    // Re-observe new elements after render
    setTimeout(() => this.observeReveals(), 50);
  },

  /* ========== HOME ========== */
  renderHome() {
    const stats = EventService.getStats();
    const upcoming = EventService.getUpcoming().slice(0, 3);

    return `
      <div class="page-header reveal">
        <h1>Welcome to College Event Management</h1>
        <p>Discover, organize and manage all campus events in one place.</p>
      </div>

      <div class="stats-grid">
        <div class="card stat-card reveal reveal-delay-1">
          <i class="fas fa-calendar-check"></i>
          <div class="number">${stats.total}</div>
          <div class="label">Total Events</div>
        </div>
        <div class="card stat-card reveal reveal-delay-2">
          <i class="fas fa-clock"></i>
          <div class="number">${stats.upcoming}</div>
          <div class="label">Upcoming</div>
        </div>
        <div class="card stat-card reveal reveal-delay-3">
          <i class="fas fa-tags"></i>
          <div class="number">${Object.keys(stats.categories).length}</div>
          <div class="label">Categories</div>
        </div>
      </div>

      <h2 class="reveal" style="margin-bottom:1.2rem;color:var(--jungle-dark);">Featured Upcoming Events</h2>
      ${upcoming.length === 0
        ? `<div class="empty-state reveal"><i class="fas fa-calendar-times"></i><p>No upcoming events. Add some from the Manage page!</p></div>`
        : `<div class="events-grid">${upcoming.map((e, i) => this.eventCardHTML(e, false, i)).join('')}</div>`
      }

      <div class="reveal" style="text-align:center;margin-top:2.8rem;">
        <button class="btn btn-primary" onclick="App.navigate('events')">
          <i class="fas fa-list"></i> View All Events
        </button>
        <button class="btn btn-outline" style="margin-left:0.8rem;" onclick="App.navigate('manage')">
          <i class="fas fa-plus"></i> Manage Events
        </button>
      </div>
    `;
  },

  /* ========== ABOUT ========== */
  renderAbout() {
    return `
      <div class="page-header reveal">
        <h1>About This Project</h1>
        <p>College Event Management System – built for students</p>
      </div>
      <div class="card about-content reveal">
        <p>This is a lightweight front-end application that helps students and event coordinators manage college events efficiently with a calm cream & jungle green aesthetic.</p>
        
        <h2>Features</h2>
        <ul>
          <li>View all upcoming and past events</li>
          <li>Search and filter events by category</li>
          <li>Add, edit and delete events (title, date, time, venue, description)</li>
          <li>Floating leaves animation + scroll reveal effects</li>
          <li>Data persists in browser LocalStorage</li>
          <li>Ready for future backend (Render + MongoDB)</li>
        </ul>

        <h2>Tech Stack</h2>
        <ul>
          <li>HTML5 + CSS3 (cream + dark jungle green theme)</li>
          <li>Vanilla JavaScript (no frameworks)</li>
          <li>LocalStorage for persistence</li>
          <li>Prepared folder structure for Node.js + Express + MongoDB</li>
        </ul>

        <h2>Future Backend</h2>
        <p>Events are stored in LocalStorage today. The same data shape can later be served from a Node.js + Express + MongoDB API.</p>
      </div>
    `;
  },

  /* ========== EVENTS ========== */
  renderEvents() {
    const events = EventService.getAll();
    return `
      <div class="page-header reveal">
        <h1>All Events</h1>
        <p>Browse and search campus events</p>
      </div>

      <div class="filters reveal">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="searchInput" placeholder="Search events..." />
        </div>
        <select class="filter-select" id="categoryFilter">
          <option value="All">All Categories</option>
          <option value="Technical">Technical</option>
          <option value="Cultural">Cultural</option>
          <option value="Sports">Sports</option>
          <option value="Workshop">Workshop</option>
          <option value="Seminar">Seminar</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div id="eventsList">
        ${this.renderEventsList(events)}
      </div>
    `;
  },

  renderEventsList(events) {
    if (events.length === 0) {
      return `<div class="empty-state reveal"><i class="fas fa-search"></i><p>No events found</p></div>`;
    }
    return `<div class="events-grid">${events.map((e, i) => this.eventCardHTML(e, false, i)).join('')}</div>`;
  },

  bindEventFilters() {
    const search = document.getElementById('searchInput');
    const filter = document.getElementById('categoryFilter');
    if (!search || !filter) return;

    const apply = () => {
      const list = EventService.filterEvents(search.value, filter.value);
      const listEl = document.getElementById('eventsList');
      if (listEl) {
        listEl.innerHTML = this.renderEventsList(list);
        setTimeout(() => this.observeReveals(), 40);
      }
    };

    search.addEventListener('input', apply);
    filter.addEventListener('change', apply);
  },

  /* ========== MANAGE ========== */
  renderManage() {
    const events = EventService.getAll();
    return `
      <div class="page-header reveal" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
        <div>
          <h1>Manage Events</h1>
          <p>Add, edit or remove events</p>
        </div>
        <button class="btn btn-primary" id="addEventBtn">
          <i class="fas fa-plus"></i> Add New Event
        </button>
      </div>

      <div class="table-container reveal">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Venue</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${events.length === 0
              ? `<tr><td colspan="6" style="text-align:center;padding:2.2rem;">No events yet. Click "Add New Event" to create one.</td></tr>`
              : events.map(e => `
                <tr>
                  <td><strong>${this.escape(e.title)}</strong></td>
                  <td>${EventService.formatDate(e.date)}</td>
                  <td>${EventService.formatTime(e.time)}</td>
                  <td>${this.escape(e.venue)}</td>
                  <td><span class="category">${this.escape(e.category)}</span></td>
                  <td class="actions-cell">
                    <button class="btn btn-sm btn-outline edit-btn" data-id="${e.id}">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${e.id}">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>
    `;
  },

  bindManageActions() {
    document.getElementById('addEventBtn')?.addEventListener('click', () => this.openModal());

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const event = EventService.getById(btn.dataset.id);
        if (event) this.openModal(event);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deleteTargetId = btn.dataset.id;
        document.getElementById('confirmMessage').textContent =
          'Are you sure you want to delete this event? This action cannot be undone.';
        document.getElementById('confirmModal').classList.add('active');
        document.body.classList.add('modal-open');
      });
    });
  },

  /* ========== MODAL ========== */
  openModal(event = null) {
    const form = document.getElementById('eventForm');
    form.reset();
    document.getElementById('eventId').value = '';

    if (event) {
      document.getElementById('modalTitle').textContent = 'Edit Event';
      document.getElementById('eventId').value = event.id;
      document.getElementById('eventTitle').value = event.title;
      document.getElementById('eventDescription').value = event.description;
      document.getElementById('eventDate').value = event.date;
      document.getElementById('eventTime').value = event.time;
      document.getElementById('eventVenue').value = event.venue;
      document.getElementById('eventCategory').value = event.category;
    } else {
      document.getElementById('modalTitle').textContent = 'Add New Event';
    }

    document.getElementById('eventModal').classList.add('active');
    document.body.classList.add('modal-open');
    setTimeout(() => document.getElementById('eventTitle')?.focus(), 50);
  },

  closeModal() {
    document.getElementById('eventModal').classList.remove('active');
    if (!document.getElementById('confirmModal').classList.contains('active')) {
      document.body.classList.remove('modal-open');
    }
  },

  closeConfirm() {
    document.getElementById('confirmModal').classList.remove('active');
    this.deleteTargetId = null;
    if (!document.getElementById('eventModal').classList.contains('active')) {
      document.body.classList.remove('modal-open');
    }
  },

  saveEvent() {
    const id = document.getElementById('eventId').value;
    const data = {
      title: document.getElementById('eventTitle').value.trim(),
      description: document.getElementById('eventDescription').value.trim(),
      date: document.getElementById('eventDate').value,
      time: document.getElementById('eventTime').value,
      venue: document.getElementById('eventVenue').value.trim(),
      category: document.getElementById('eventCategory').value
    };

    if (!data.title || !data.description || !data.date || !data.time || !data.venue || !data.category) {
      this.showToast('Please fill all required fields', 'error');
      return;
    }

    if (id) {
      EventService.update(id, data);
      this.showToast('Event updated successfully', 'success');
    } else {
      EventService.create(data);
      this.showToast('Event added successfully', 'success');
    }

    this.closeModal();
    this.render();
  },

  /* ========== HELPERS ========== */
  eventCardHTML(event, showActions = true, index = 0) {
    const delayClass = index < 3 ? `reveal-delay-${index + 1}` : '';
    return `
      <div class="card event-card reveal ${delayClass}">
        <span class="category">${this.escape(event.category || '')}</span>
        <h3>${this.escape(event.title)}</h3>
        <p class="description">${this.escape(event.description)}</p>
        <div class="event-meta">
          <div><i class="fas fa-calendar"></i> ${EventService.formatDate(event.date)}</div>
          <div><i class="fas fa-clock"></i> ${EventService.formatTime(event.time)}</div>
          <div><i class="fas fa-map-marker-alt"></i> ${this.escape(event.venue)}</div>
        </div>
        ${showActions ? `
          <div class="event-actions">
            <button class="btn btn-sm btn-outline" onclick="App.openModal(EventService.getById('${event.id}'))">
              <i class="fas fa-edit"></i> Edit
            </button>
          </div>
        ` : ''}
      </div>
    `;
  },

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${this.escape(message)}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());