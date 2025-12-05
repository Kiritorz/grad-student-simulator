import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GradStudentSimulator from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GradStudentSimulator />
  </StrictMode>,
)
