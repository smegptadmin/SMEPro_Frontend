// src/Login.jsx
import React, { useEffect } from 'react';

// Utility to build the Google OAuth authorization URL
function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id: '748515429645-uv6m8g2gj3ffgn3m09u140nbahceggm4.apps.googleusercontent.com',
    redirect_uri: process.env.REACT_APP_OAUTH_REDIRECT_URI || 'http://localhost:8000/oauth2/callback',
    response_type: 'code',
    scope: [
      'openid',
      'email',
      'profile'
    ].join(' '),
    access_type: 'offline',        // request refresh token
    include_granted_scopes: 'true',
    prompt: 'consent',             // to get refresh token consistently
    state: window.location.pathname // optional: return to current page
    // Optional: PKCE (recommended). You can add code_challenge & code_challenge_method if generating PKCE on client.
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export default function Login() {
  useEffect(() => {
    // Optionally prefetch or set up state
  }, []);

  const handleLogin = () => {
    window.location.href = buildAuthUrl();
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Sign in to SMEPro</h1>
      <p>Use your Google account to continue.</p>
      <button onClick={handleLogin}>
        Continue with Google
      </button>
    </div>
  );
}
