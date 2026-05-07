// admin-init.js — include on every admin page
// Usage: <script>initAdmin('pagename');</script>

async function initAdmin(activePage) {
  const ok = await Auth.requireAuth();
  if (!ok) return;

  try {
    const res  = await fetch('/admin/header.html');
    const html = await res.text();
    document.getElementById('header-placeholder').innerHTML = html;

    // Set active nav link
    if (activePage) {
      const link = document.querySelector(`.nav-link[data-page="${activePage}"]`);
      if (link) link.classList.add('active');
    }

    // Populate user info
    const user = Auth.getUser();
    if (user) {
      const avatar   = document.getElementById('header-avatar');
      const username = document.getElementById('header-username');
      if (avatar)   avatar.textContent   = user.username.charAt(0).toUpperCase();
      if (username) username.textContent = user.username;
    }
  } catch (err) {
    console.error('Header load failed:', err);
  }

  document.getElementById('page-content').style.display = 'block';
}
