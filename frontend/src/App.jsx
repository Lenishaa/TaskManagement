import React, { useState, useEffect } from 'react'
import axios from 'axios'
import io from 'socket.io-client'

const API = import.meta.env.VITE_API || 'http://localhost:4000'

function Login({ onAuth }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const login = async (e) => {
    e.preventDefault()
    if (!u || !p) { setError('Username and password required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(API + '/api/auth/login', { username: u, password: p })
      onAuth(res.data.token)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (<form className="auth" onSubmit={login}>
    <h3>Login</h3>
    <input placeholder="username" value={u} onChange={e=>setU(e.target.value)} disabled={loading} />
    <input placeholder="password" type="password" value={p} onChange={e=>setP(e.target.value)} disabled={loading} />
    {error && <p className="error">{error}</p>}
    <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
  </form>)
}

function Register({ onAuth }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const register = async (e) => {
    e.preventDefault()
    if (!u || !p) { setError('Username and password required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(API + '/api/auth/register', { username: u, password: p })
      onAuth(res.data.token)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (<form className="auth" onSubmit={register}>
    <h3>Register</h3>
    <input placeholder="username" value={u} onChange={e=>setU(e.target.value)} disabled={loading} />
    <input placeholder="password" type="password" value={p} onChange={e=>setP(e.target.value)} disabled={loading} />
    {error && <p className="error">{error}</p>}
    <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
  </form>)
}

function TaskApp({ token, onLogout }){
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(()=>{
    if(!token) return;
    const fetchTasks = async ()=>{
      try {
        const res = await axios.get(API + '/api/tasks', { headers: { Authorization: 'Bearer '+token } })
        setTasks(res.data)
      } catch (err) {
        setError('Failed to load tasks')
      }
    }
    fetchTasks()
    
    const socket = io(API)
    socket.on('task:created', (m)=> setTasks(t => [m.task, ...t]))
    socket.on('task:updated', (m)=> setTasks(t => t.map(x=> x.id===m.task.id?m.task:x)))
    socket.on('task:deleted', (m)=> setTasks(t => t.filter(x=> x.id !== m.id)))
    socket.on('connect_error', (err) => setError('Connection error: ' + err.message))
    return ()=> socket.disconnect()
  }, [token])

  const add = async (e)=>{
    e.preventDefault()
    if(!title.trim()) return;
    setLoading(true)
    try {
      await axios.post(API + '/api/tasks', { title }, { headers: { Authorization: 'Bearer '+token } })
      setTitle('')
    } catch (err) {
      setError('Failed to add task')
    } finally {
      setLoading(false)
    }
  }

  const toggle = async (t)=>{
    try {
      await axios.put(API + '/api/tasks/' + t.id, { completed: !t.completed }, { headers: { Authorization: 'Bearer '+token } })
    } catch (err) {
      setError('Failed to update task')
    }
  }

  const remove = async (t)=>{
    try {
      await axios.delete(API + '/api/tasks/' + t.id, { headers: { Authorization: 'Bearer '+token } })
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  return (<div className="taskapp">
    {error && <div className="error-banner">{error} <button onClick={()=>setError('')}>✕</button></div>}
    <form className="add" onSubmit={add}>
      <input placeholder="New task" value={title} onChange={e=>setTitle(e.target.value)} disabled={loading} />
      <button type="submit" disabled={loading}>{loading ? '...' : 'Add'}</button>
    </form>
    <ul className="tasks">
      {tasks.map(t=> (
        <li key={t.id} className={t.completed? 'done' : ''}>
          <label>
            <input type="checkbox" checked={t.completed} onChange={()=>toggle(t)} />
            <span>{t.title}</span>
          </label>
          <button className="del" onClick={()=>remove(t)}>Delete</button>
        </li>
      ))}
    </ul>
    <button className="logout" onClick={onLogout}>Logout</button>
  </div>)
}

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  useEffect(()=> localStorage.setItem('token', token||''), [token])
  if(!token) return (<div className="wrap"><Login onAuth={t=>setToken(t)} /><Register onAuth={t=>setToken(t)} /></div>)
  return (<TaskApp token={token} onLogout={()=>setToken(null)} />)
}
