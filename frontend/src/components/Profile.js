//profile.js
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const FULL_NAME_REGEX = /^[A-Z][a-z]{2,}(?: [A-Z][a-z]{2,})$/;
const PHONE_REGEX = /^(98|97)\d{8}$/;

function Profile() {
  const { token, user, apiBaseUrl } = useContext(AuthContext);
  const [profile, setProfile] = useState(user || null);
  const [fullName, setFullName] = useState(user?.name || user?.full_name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (token) {
      axios.get(`${apiBaseUrl}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setProfile(res.data);
          setFullName(res.data.full_name || "");
          setLocation(res.data.location || "");
          setPhone(res.data.phone || "");
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load profile");
        });
    }
  }, [token, apiBaseUrl]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setError("Full name is required");
      return;
    }
    if (!FULL_NAME_REGEX.test(trimmedName)) {
      setError("Full name must be like 'Ram Kumar' with 2 words, each 3+ letters, starting with a capital letter.");
      return;
    }
    if (phone && !PHONE_REGEX.test(phone.trim())) {
      setError("Phone must be 10 digits and start with 98 or 97.");
      return;
    }

    // Password validation if password is being changed
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const updateData = { full_name: fullName, location };
      if (password) {
        updateData.password = password;
      }

      await axios.put(`${apiBaseUrl}/api/auth/profile`, updateData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setProfile((current) => ({ ...current, full_name: fullName, location }));
      setMessage("Profile updated successfully");
      setIsEditing(false);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Unable to update profile");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFullName(profile?.full_name || "");
    setLocation(profile?.location || "");
    setPhone(profile?.phone || "");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
  };

  if (!profile) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Please login to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="container py-4 profile-page">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="mb-0">My Profile</h3>
              {!isEditing && (
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
            <div className="card-body">
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              {!isEditing ? (
                <div className="profile-view">
                  <div className="profile-avatar mb-4">
                    <div className="avatar-circle">
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="profile-details">
                    <div className="detail-item">
                      <label>Full Name:</label>
                      <span>{profile.full_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{profile.phone}</span>
                    </div>
                    <div className="detail-item">
                      <label>Location:</label>
                      <span>{profile.location}</span>
                    </div>
                    <div className="detail-item">
                      <label>Role:</label>
                      <span className="badge bg-info">{profile.role}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input 
                      className="form-control" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input 
                      className="form-control" 
                      value={phone} 
                      disabled
                    />
                    <small className="text-muted">Phone cannot be changed</small>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input 
                      className="form-control" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  <hr className="my-4" />
                  <h5>Change Password</h5>
                  <p className="text-muted small">Leave blank to keep current password</p>

                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input 
                      type="password"
                      className="form-control" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input 
                      type="password"
                      className="form-control" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-primary" type="submit">Save Changes</button>
                    <button 
                      className="btn btn-secondary" 
                      type="button"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;