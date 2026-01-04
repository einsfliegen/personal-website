import React, { useEffect, useState } from 'react'
import './App.css'

function UserBox({ user, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [role, setRole] = useState(user.role || 'Viewer')
  const [active, setActive] = useState(Boolean(user.active))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setRole(user.role || 'Viewer')
    setActive(Boolean(user.active))
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/admin/api/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, active })
      })
      if (!res.ok) throw new Error('Update failed')
      onSaved()
      setEditing(false)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteUser = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)
    if (!confirmed) return
    setDeleting(true)
    try {
      const res = await fetch(`/admin/api/users/${user._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) {
        let msg = `Delete failed (${res.status})`
        try {
          const body = await res.json()
          if (body && body.error) msg = body.error
        } catch (_) {}
        throw new Error(msg)
      }
      // refresh parent list
      onSaved()
    } catch (e) {
      alert(e.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="user-box">
      <div className="user-main">
        <div>
          <div className="user-name">{user.username}</div>
          <div className="user-email">{user.email}</div>
        </div>
        <div className="user-meta">
          <div className="user-role">Role: {user.role}</div>
          <div className="user-active">Active: {user.active ? 'Yes' : 'No'}</div>
        </div>
      </div>
      <div className="user-actions">
        {!editing && (
          <button onClick={() => setEditing((v) => !v)} className="edit-btn">Edit User</button>
        )}
      </div>
      {editing && (
        <div className="edit-panel">
          <label>
            Role:
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Admin">Admin</option>
              <option value="Creator">Creator</option>
              <option value="Viewer">Viewer</option>
            </select>
          </label>
          <label className="active-label">
            Active:
            <select value={String(active)} onChange={(e) => setActive(e.target.value === 'true')}>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </label>
          <div className="edit-buttons">
            <button onClick={deleteUser} disabled={deleting} className="delete-btn">{deleting ? 'Deleted...' : 'Delete'}</button>
            <button onClick={save} disabled={saving} className="save-btn">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => { setRole(user.role || 'Viewer'); setActive(Boolean(user.active)); setEditing(false); }} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/admin/api/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="admin-root">
      <h1>Registered Users</h1>
      {loading && <div className="status">Loading users...</div>}
      {error && <div className="status error">{error}</div>}
      <div className="users-list">
        {users.map((u) => (
          <UserBox key={u._id} user={u} onSaved={fetchUsers} />
        ))}
      </div>
      {!loading && users.length === 0 && <div className="status">No users found.</div>}
    </div>
  )
}
