import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rolePermissions, actionLabels, hasPermission } from '../config/rolesConfig';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { fetchEditorRequests, approveEditorRequest, rejectEditorRequest } = useAuth();
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const authToken = user?.token; // adjust if token lives elsewhere (e.g. context)

  const loadUsers = () => {
    setLoadingUsers(true);
    setUsersError('');
    fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      credentials: 'include'
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load users');
        return r.json();
      })
      .then(data => setUsers(Array.isArray(data) ? data : (data.users || [])))
      .catch(err => setUsersError(err.message))
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    loadUsers();
    loadRequests();
  }, [authToken]);

  const loadRequests = async () => {
    try {
      const res = await fetchEditorRequests();
      if (res.success) {
        setRequests(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load requests', err);
    }
  };

  const viewerUsers = users.filter(u => u.role?.toLowerCase() === 'viewer');
  const editorUsers = users.filter(u => u.role?.toLowerCase() === 'editor');
  const actions = Object.keys(actionLabels);
  const normalizedRole = user?.role?.toLowerCase();

  return (
    <div className="admin-container">
      <nav className="navbar">
        <h1>RBAC MERN App - Admin Dashboard</h1>
        <div className="nav-right">
          <span className="user-info">
            {user?.username} ({user?.role})
          </span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        <div className="admin-card">
          <h2>Admin Dashboard</h2>
          <p>Welcome to the Admin Dashboard. This page is only accessible to users with the Admin role.</p>
          
          <div className="admin-info">
            <h3>Your Permissions:</h3>
            <ul>
              {rolePermissions[normalizedRole]?.map(p => (
                <li key={p}>✅ {actionLabels[p]}</li>
              )) || <li>No permissions found.</li>}
            </ul>
          </div>

          <div className="registered-users">
            <h3>Registered Viewer & Editor Users</h3>
            <button onClick={loadUsers} style={{ marginBottom: '8px' }}>Refresh</button>
            {loadingUsers && <p>Loading users...</p>}
            {usersError && <p style={{ color: 'red' }}>{usersError}</p>}
            {!loadingUsers && !usersError && (
              <div className="user-lists">
                <div>
                  <strong>Viewers ({viewerUsers.length}):</strong>
                  {viewerUsers.length === 0 ? <p>No viewers registered.</p> : (
                    <ul>
                      {viewerUsers.map(u => (
                        <li key={u._id || u.id}>{u.username}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <strong>Editors ({editorUsers.length}):</strong>
                  {editorUsers.length === 0 ? <p>No editors registered.</p> : (
                    <ul>
                      {editorUsers.map(u => (
                        <li key={u._id || u.id}>{u.username}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

            <div className="editor-requests">
              <h3>Pending Editor Requests ({requests.length})</h3>
              <button onClick={loadRequests} style={{ marginBottom: '8px' }}>Refresh</button>
              {requests.length === 0 ? <p>No pending requests.</p> : (
                <ul>
                  {requests.map(r => (
                    <li key={r._id} style={{ marginBottom: '8px' }}>
                      <strong>{r.username}</strong> ({r.email})
                      <div style={{ marginTop: '6px' }}>
                        <button onClick={async () => { const res = await approveEditorRequest(r._id); if (res.success) { loadUsers(); loadRequests(); } else { alert(res.error); } }} style={{ marginRight: '8px' }}>Approve</button>
                        <button onClick={async () => { const res = await rejectEditorRequest(r._id); if (res.success) { loadRequests(); } else { alert(res.error); } }}>Reject</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          <Link to="/posts" className="back-link">
            ← Back to Posts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

