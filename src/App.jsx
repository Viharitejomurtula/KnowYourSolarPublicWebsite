import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import WhatYouGet from './components/WhatYouGet.jsx'
import Independence from './components/Independence.jsx'
import UploadSection from './components/UploadSection.jsx'
import Footer from './components/Footer.jsx'
import { useAuth } from './hooks/useAuth.js'

export default function App() {
  const auth = useAuth()

  return (
    <>
      <Nav auth={auth} />
      <Hero />
      <div className="divider">
        <div className="divider-line" />
        <div className="divider-mark">◇</div>
        <div className="divider-line" />
      </div>
      <WhatYouGet />
      <Independence />
      <UploadSection auth={auth} />
      <Footer />
    </>
  )
}
