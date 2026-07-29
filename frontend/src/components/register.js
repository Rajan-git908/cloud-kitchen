import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password })
      });

      const data = await res.json();

      if (data && data.success) {
        // Use AuthContext to set state and localStorage
        const userObj = { id: data.userId, name, phone, role: 'user' };
        auth.login(userObj);
        setSuccessMsg('Registration successful! Redirecting...');
        setName('');
        setPhone('');
        setPassword('');

        // Redirect after short delay
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className={`auth-card ${mounted ? 'enter' : ''} register`}>
        <div className="auth-side auth-left">
          <h2 className="auth-head">Create Account</h2>
          <p className="auth-sub">Register to start using the app.</p>
        </div>

        <div className="auth-side auth-right">
          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            <label className="field">
              <input
                className="input"
                type="text"
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <span className="label">Full Name</span>
            </label>
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

            {errorMsg && <div className="error-message">{errorMsg}</div>}
            {successMsg && <div className="success-message">{successMsg}</div>}

            <div className="auth-actions">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Please wait…' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;