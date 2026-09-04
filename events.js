/**
 * events.js – Event CRUD + formatting helpers
 */
const EventService = {
  getAll() {
    return Storage.getAll().sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return String(a.time || '').localeCompare(String(b.time || ''));
    });
  },

  getById(id) {
    return Storage.getById(id);
  },

  getUpcoming() {
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');
    return this.getAll().filter(e => e.date >= today);
  },

  getByCategory(category) {
    if (!category || category === 'All') return this.getAll();
    return this.getAll().filter(e => e.category === category);
  },

  search(query) {
    return this.filterEvents(query, 'All');
  },

  filterEvents(query, category) {
    let list = this.getByCategory(category);
    const q = (query || '').toLowerCase().trim();
    if (!q) return list;
    return list.filter(e =>
      (e.title || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q) ||
      (e.venue || '').toLowerCase().includes(q)
    );
  },

  create(data) {
    const event = {
      id: Storage.generateId(),
      title: data.title.trim(),
      description: data.description.trim(),
      date: data.date,
      time: data.time,
      venue: data.venue.trim(),
      category: data.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    Storage.add(event);
    return event;
  },

  update(id, data) {
    const updated = {
      title: data.title.trim(),
      description: data.description.trim(),
      date: data.date,
      time: data.time,
      venue: data.venue.trim(),
      category: data.category,
      updatedAt: new Date().toISOString()
    };
    return Storage.update(id, updated);
  },

  delete(id) {
    return Storage.remove(id);
  },

  getStats() {
    const all = this.getAll();
    const upcoming = this.getUpcoming();
    const categories = {};
    all.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + 1;
    });
    return {
      total: all.length,
      upcoming: upcoming.length,
      categories
    };
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const parsed = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(parsed.getTime())) return dateStr;
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return parsed.toLocaleDateString('en-IN', options);
  },

  formatTime(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return timeStr || '—';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    if (Number.isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const display = hour % 12 || 12;
    return `${display}:${(m || '00').padStart(2, '0')} ${ampm}`;
  }
};