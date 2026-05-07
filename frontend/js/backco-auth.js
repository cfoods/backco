// backco-auth.js — shared on every page
// Usage: <script src="/js/backco-auth.js"></script>

const Auth = (() => {
  const TOKEN_KEY = 'backco_token';
  const USER_KEY  = 'backco_user';

  const save = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clear = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const getUser  = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  };

  // Call on every protected page — redirects to /home if not valid
  const requireAuth = async () => {
    const token = getToken();
    if (!token) { window.location.href = '/home'; return false; }
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Invalid');
      return true;
    } catch {
      clear();
      window.location.href = '/home';
      return false;
    }
  };

  // Call on login/signup pages — redirects to /admin if already logged in
  const redirectIfAuthed = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) window.location.href = '/admin';
    } catch { clear(); }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    clear();
    window.location.href = '/home';
  };

  return { save, clear, getToken, getUser, requireAuth, redirectIfAuthed, logout };
})();
