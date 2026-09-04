/**
 * storage.js – LocalStorage helper (ready for MongoDB swap later)
 */
const Storage = {
  KEY: 'college_events_v1',

  getAll() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load events', e);
      return [];
    }
  },

  saveAll(events) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events', e);
    }
  },

  getById(id) {
    const key = String(id);
    return this.getAll().find(e => String(e.id) === key) || null;
  },

  add(event) {
    const events = this.getAll();
    events.push(event);
    this.saveAll(events);
    return event;
  },

  update(id, updated) {
    const events = this.getAll();
    const key = String(id);
    const index = events.findIndex(e => String(e.id) === key);
    if (index === -1) return null;
    events[index] = { ...events[index], ...updated, id: events[index].id };
    this.saveAll(events);
    return events[index];
  },

  remove(id) {
    const key = String(id);
    const events = this.getAll().filter(e => String(e.id) !== key);
    this.saveAll(events);
    return true;
  },

  seedIfEmpty() {
    if (this.getAll().length === 0) {
      const samples = [
        {
          id: this.generateId(),
          title: 'Tech Symposium 2026',
          description: 'Annual technical symposium featuring coding competitions, robotics, and guest lectures from industry experts.',
          date: '2026-10-15',
          time: '09:30',
          venue: 'Main Auditorium',
          category: 'Technical',
          createdAt: new Date().toISOString()
        },
        {
          id: this.generateId(),
          title: 'Cultural Night',
          description: 'An evening of music, dance and drama performances by students from all departments.',
          date: '2026-11-05',
          time: '18:00',
          venue: 'Open Air Theatre',
          category: 'Cultural',
          createdAt: new Date().toISOString()
        },
        {
          id: this.generateId(),
          title: 'Inter-College Cricket Tournament',
          description: 'Knockout cricket tournament open to all affiliated colleges. Registrations start soon.',
          date: '2026-09-20',
          time: '08:00',
          venue: 'College Sports Ground',
          category: 'Sports',
          createdAt: new Date().toISOString()
        },
        {
          id: this.generateId(),
          title: 'AI & ML Workshop',
          description: 'Hands-on workshop on Machine Learning fundamentals using Python and TensorFlow.',
          date: '2026-09-28',
          time: '10:00',
          venue: 'Computer Lab 3',
          category: 'Workshop',
          createdAt: new Date().toISOString()
        }
      ];
      this.saveAll(samples);
    }
  },

  generateId() {
    return 'evt_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
};