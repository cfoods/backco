<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Backco — Create Account</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --earth:  #1a1a14;
      --bark:   #2c2416;
      --moss:   #3d4a2e;
      --sage:   #7a8c5e;
      --stone:  #a89f8c;
      --cream:  #f0ebe0;
      --accent: #c8a951;
      --danger: #c0392b;
      --ok:     #5a8a5e;
    }

    html, body {
      min-height: 100%;
      background: var(--earth);
      color: var(--cream);
      font-family: 'DM Sans', sans-serif;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 70% at 90% 10%, rgba(61,74,46,0.35) 0%, transparent 60%),
        radial-gradient(ellipse 80% 50% at 10% 90%, rgba(44,36,22,0.5) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }

    .page {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .card {
      width: 100%;
      max-width: 440px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--stone);
      font-size: 0.75rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-decoration: none;
      margin-bottom: 2.5rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: var(--cream); }

    .brand-logo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.5rem;
      letter-spacing: 0.08em;
      color: var(--cream);
      line-height: 1;
      margin-bottom: 0.2rem;
    }

    .card-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }

    .card-hint {
      font-size: 0.8rem;
      color: var(--stone);
      margin-bottom: 2rem;
      font-weight: 300;
      line-height: 1.5;
    }

    /* Warning banner */
    .warning {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background: rgba(200,169,81,0.08);
      border: 1px solid rgba(200,169,81,0.25);
      border-radius: 4px;
      margin-bottom: 1.75rem;
      font-size: 0.78rem;
      color: var(--stone);
      line-height: 1.5;
    }

    .warning-icon {
      font-size: 1rem;
      flex-shrink: 0;
      margin-top: 0.05rem;
    }

    .field { margin-bottom: 1.1rem; }

    label {
      display: block;
      font-size: 0.68rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--stone);
      margin-bottom: 0.45rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(168,159,140,0.18);
      border-radius: 4px;
      padding: 0.85rem 1rem;
      color: var(--cream);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
    }

    input::placeholder { color: rgba(168,159,140,0.35); }
    input:focus {
      border-color: var(--accent);
      background: rgba(200,169,81,0.05);
    }

    input.valid   { border-color: var(--ok); }
    input.invalid { border-color: var(--danger); }

    .field-hint {
      font-size: 0.7rem;
      color: var(--stone);
      margin-top: 0.35rem;
      opacity: 0.7;
    }

    .btn {
      width: 100%;
      padding: 1rem;
      margin-top: 0.5rem;
      background: var(--accent);
      color: var(--earth);
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.2rem;
      letter-spacing: 0.1em;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn:hover    { background: #d4b55a; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .msg {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 4px;
      font-size: 0.82rem;
      display: none;
    }

    .msg.error {
      background: rgba(192,57,43,0.15);
      border: 1px solid rgba(192,57,43,0.3);
      color: #e57373;
    }

    .msg.success {
      background: rgba(90,138,94,0.15);
      border: 1px solid rgba(90,138,94,0.3);
      color: #81c784;
    }

    .msg.show { display: block; }

    .divider {
      border: none;
      border-top: 1px solid rgba(168,159,140,0.1);
      margin: 1.5rem 0;
    }

    .card-foot {
      font-size: 0.75rem;
      color: var(--stone);
      text-align: center;
    }

    .card-foot a { color: var(--accent); text-decoration: none; }
    .card-foot a:hover { text-decoration: underline; }
  </style>
</head>
<body>
<div class="page">
  <div class="card">
    <a class="back-link" href="/home">← Back to Login</a>

    <div class="brand-logo">BACKCO</div>
    <div class="card-title">Create Account</div>
    <div class="card-hint">Set up access to the Backcountry Landscaping portal.</div>

    <div class="warning">
      <span class="warning-icon">⚠</span>
      <span>This page is not publicly advertised. Accounts created here have admin access. Only create accounts for trusted team members.</span>
    </div>

    <div class="field">
      <label for="username">Username</label>
      <input id="username" type="text" placeholder="e.g. jsmith" autocomplete="username" />
      <div class="field-hint">Lowercase, 3+ characters. Used to log in.</div>
    </div>

    <div class="field">
      <label for="email">Email</label>
      <input id="email" type="email" placeholder="you@example.com" autocomplete="email" />
    </div>

    <div class="field">
      <label for="password">Password</label>
      <input id="password" type="password" placeholder="Min. 8 characters" autocomplete="new-password" />
    </div>

    <div class="field">
      <label for="confirm">Confirm Password</label>
      <input id="confirm" type="password" placeholder="Repeat password" autocomplete="new-password" />
    </div>

    <button class="btn" id="signupBtn" onclick="handleSignup()">Create Account</button>

    <div class="msg error" id="errorMsg"></div>
    <div class="msg success" id="successMsg"></div>

    <hr class="divider" />
    <div class="card-foot">Already have an account? <a href="/home">Sign in</a></div>
  </div>
</div>

<script src="/js/backco-auth.js"></script>
<script>
  Auth.redirectIfAuthed();

  const btn        = document.getElementById('signupBtn');
  const errorMsg   = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');
  const confirmInput = document.getElementById('confirm');
  const passInput    = document.getElementById('password');

  confirmInput.addEventListener('input', () => {
    if (confirmInput.value && confirmInput.value !== passInput.value) {
      confirmInput.classList.add('invalid');
      confirmInput.classList.remove('valid');
    } else if (confirmInput.value) {
      confirmInput.classList.remove('invalid');
      confirmInput.classList.add('valid');
    }
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('show');
    successMsg.classList.remove('show');
  }

  function showSuccess(msg) {
    successMsg.textContent = msg;
    successMsg.classList.add('show');
    errorMsg.classList.remove('show');
  }

  async function handleSignup() {
    errorMsg.classList.remove('show');
    successMsg.classList.remove('show');

    const username = document.getElementById('username').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = passInput.value;
    const confirm  = confirmInput.value;

    if (!username || !email || !password || !confirm) {
      showError('All fields are required.'); return;
    }
    if (password !== confirm) {
      showError('Passwords do not match.'); return;
    }
    if (password.length < 8) {
      showError('Password must be at least 8 characters.'); return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating...';

    try {
      const res  = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (data.success) {
        Auth.save(data.token, data.user);
        showSuccess(`Account created for "${data.user.username}". Redirecting...`);
        setTimeout(() => { window.location.href = '/admin'; }, 1500);
      } else {
        showError(data.message || 'Signup failed.');
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    } catch {
      showError('Connection error. Is the server running?');
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  }
</script>
</body>
</html>
