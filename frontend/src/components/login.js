import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await res.json();

      if (data.success) {
        // Save user info locally for dashboard
        const userObj = { id: data.user.id, name: data.user.name, phone: data.user.phone, role: data.user.role };
        auth.login(userObj);

        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card login">
        <div className="auth-side auth-left">
          <h2 className="auth-head">Welcome Back</h2>
          <p className="auth-sub">Sign in to continue.</p>
        </div>

        <div className="auth-side auth-right">
          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            <label className="field">
              <input
                className="input"
                type="tel"
                placeholder=" "
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <span className="label">Phone</span>
            </label>

            <label className="field">
              <input
                className="input"
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="label">Password</span>
            </label>

            <div className="auth-actions">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Please wait…' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;