import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NewLinkedinPost from './NewLinkedinPost'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/new" element={<NewLinkedinPost />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  )
}
