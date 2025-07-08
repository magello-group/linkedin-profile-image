import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NewEmployee from './NewEmployee'
import ProfileImage from './ProfileImage'
import IndexPage from './IndexPage'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/badge" element={<App />} />
          <Route path="/linkedin-new-work" element={<NewEmployee />} />
          <Route path="/profile" element={<ProfileImage />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  )
}
