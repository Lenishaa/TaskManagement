import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import io from 'socket.io-client'

const API = import.meta.env.VITE_API || 'http://localhost:4000'

// Modern color scheme
const colors = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0'
}

function Login({ onAuth }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  
  const submit = async (e) => {
    e.preventDefault()
    if (!u || !p) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      const endpoint = isRegister ? '/register' : '/login'
      const res = await axios.post(API + '/api/auth' + endpoint, { username: u, password: p })
      onAuth(res.data.token)
    } catch (err) {
      const errorData = err.response?.data
      if (errorData?.details && Array.isArray(errorData.details)) {
        // Show validation errors
        setError(errorData.details.join('. '))
      } else if (errorData?.error) {
        setError(errorData.error)
      } else {
        setError('Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Task Manager</h1>
          <p>{isRegister ? 'Create your account' : 'Welcome back!'}</p>
        </div>
        
        <form className="auth-form" onSubmit={submit}>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Username" 
              value={u} 
              onChange={e=>setU(e.target.value)} 
              disabled={loading}
              autoComplete="username"
            />
          </div>
          
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={p} 
              onChange={e=>setP(e.target.value)} 
              disabled={loading}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => { setIsRegister(!isRegister); setError('') }} className="link-button">
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function TaskApp({ token, onLogout }){
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [filter, setFilter] = useState('all') // all, active, completed
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 })
  
  const updateStats = useCallback((tasksList) => {
    setStats({
      total: tasksList.length,
      active: tasksList.filter(t => !t.completed).length,
      completed: tasksList.filter(t => t.completed).length
    })
  }, [])
  
  useEffect(()=>{
    if(!token) return;
    const fetchTasks = async ()=>{
      try {
        const res = await axios.get(API + '/api/tasks', { headers: { Authorization: 'Bearer '+token } })
        const tasksData = res.data
        setTasks(tasksData)
        updateStats(tasksData)
      } catch (err) {
        setError('Failed to load tasks')
      }
    }
    fetchTasks()
    
    const socket = io(API, {
      auth: { token }
    })
    
    socket.on('connect', () => {
      console.log('Connected to server with socket ID:', socket.id)
    })
    
    socket.on('task:created', (m)=> { 
      setTasks(t => { 
        const newTasks = [m.task, ...t]
        updateStats(newTasks)
        return newTasks 
      })
    })
    
    socket.on('task:updated', (m)=> { 
      setTasks(t => { 
        const updatedTasks = t.map(x=> x.id===m.task.id?m.task:x)
        updateStats(updatedTasks)
        return updatedTasks 
      })
    })
    
    socket.on('task:deleted', (m)=> { 
      setTasks(t => { 
        const filteredTasks = t.filter(x=> x.id !== m.id)
        updateStats(filteredTasks)
        return filteredTasks 
      })
    })
    
    socket.on('connect_error', (err) => {
      console.error('Connection error:', err)
      // Don't show error banner for connection issues, just log them
    })
    
    return ()=> socket.disconnect()
  }, [token, updateStats])
  
  const add = async (e)=>{
    e.preventDefault()
    if(!title.trim()) return;
    setLoading(true)
    try {
      await axios.post(API + '/api/tasks', { 
        title: title.trim(), 
        description: description.trim() 
      }, { headers: { Authorization: 'Bearer '+token } })
      setTitle('')
      setDescription('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add task')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const toggle = async (t)=>{
    try {
      await axios.put(API + '/api/tasks/' + t.id, { completed: !t.completed }, { headers: { Authorization: 'Bearer '+token } })
    } catch (err) {
      setError('Failed to update task')
      setTimeout(() => setError(''), 3000)
    }
  }

  const remove = async (id)=>{
    try {
      await axios.delete(API + '/api/tasks/' + id, { headers: { Authorization: 'Bearer '+token } })
    } catch (err) {
      setError('Failed to delete task')
      setTimeout(() => setError(''), 3000)
    }
  }

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
  }

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return
    try {
      await axios.put(API + '/api/tasks/' + id, { 
        title: editTitle.trim(), 
        description: editDescription.trim() 
      }, { headers: { Authorization: 'Bearer '+token } })
      setEditingId(null)
      setEditTitle('')
      setEditDescription('')
    } catch (err) {
      setError('Failed to update task')
      setTimeout(() => setError(''), 3000)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
  }

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && !task.completed) || 
      (filter === 'completed' && task.completed)
    
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  const clearCompleted = async () => {
    const completedTasks = tasks.filter(t => t.completed)
    for (const task of completedTasks) {
      await remove(task.id)
    }
  }

  return (
    <div className="taskapp">
      {error && <div className="error-banner">{error} <button onClick={()=>setError('')}>✕</button></div>}
      
      <div className="task-header">
        <h2>My Tasks</h2>
        <div className="stats">
          <span className="stat">{stats.total} total</span>
          <span className="stat active">{stats.active} active</span>
          <span className="stat completed">{stats.completed} completed</span>
        </div>
      </div>

      <form className="add-task-form" onSubmit={add}>
        <div className="form-row">
          <input 
            className="task-title-input"
            placeholder="What needs to be done?" 
            value={title} 
            onChange={e=>setTitle(e.target.value)} 
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <textarea 
            className="task-description-input"
            placeholder="Add a description (optional)" 
            value={description} 
            onChange={e=>setDescription(e.target.value)} 
            disabled={loading}
            rows="2"
          />
        </div>
        <button type="submit" className="add-button" disabled={loading || !title.trim()}>
          {loading ? 'Adding...' : '+ Add Task'}
        </button>
      </form>

      <div className="task-controls">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        {stats.completed > 0 && (
          <button className="clear-completed" onClick={clearCompleted}>
            Clear Completed
          </button>
        )}
      </div>

      <div className="tasks-container">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>{searchQuery ? 'No tasks match your search' : filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks`}</p>
          </div>
        ) : (
          <ul className="tasks">
            {filteredTasks.map(t=> (
              <li key={t.id} className={t.completed? 'done' : ''}>
                {editingId === t.id ? (
                  <div className="edit-form">
                    <input 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                    />
                    <textarea 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows="2"
                    />
                    <div className="edit-actions">
                      <button onClick={() => saveEdit(t.id)} className="save-btn">Save</button>
                      <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="task-label">
                      <input 
                        type="checkbox" 
                        checked={t.completed} 
                        onChange={()=>toggle(t)} 
                      />
                      <div className="task-content">
                        <span className="task-title">{t.title}</span>
                        {t.description && <span className="task-description">{t.description}</span>}
                      </div>
                    </label>
                    <div className="task-actions">
                      <button className="edit-btn" onClick={()=>startEdit(t)}>Edit</button>
                      <button className="del" onClick={()=>remove(t.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="logout" onClick={onLogout}>Logout</button>
    </div>
  )
}

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  useEffect(()=> localStorage.setItem('token', token||''), [token])
  if(!token) return (<div className="wrap"><Login onAuth={t=>setToken(t)} /></div>)
  return (<TaskApp token={token} onLogout={()=>setToken(null)} />)
}