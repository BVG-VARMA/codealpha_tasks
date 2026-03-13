// ============================================================
//  api.js  –  Central fetch wrapper for all backend calls
// ============================================================

const API_BASE = '/api';

const api = {

  // ── Core request ─────────────────────────────────────────
  async request(method, endpoint, body = null) {
    const token = localStorage.getItem('token');

    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(API_BASE + endpoint, options);
    const data     = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }

    return data;
  },

  // ── Shorthand methods ─────────────────────────────────────
  get(endpoint)          { return this.request('GET',    endpoint); },
  post(endpoint, body)   { return this.request('POST',   endpoint, body); },
  put(endpoint, body)    { return this.request('PUT',    endpoint, body); },
  delete(endpoint)       { return this.request('DELETE', endpoint); },
};