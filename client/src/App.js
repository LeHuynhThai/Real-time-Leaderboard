import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

function Game() {
  return (
    <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0, backgroundColor: '#f7f7f7' }}>
      <iframe
        title="T-Rex Game"
        src={`/game/dinosaur.html`}
        style={{ border: 'none', width: '100%', height: 'calc(100% - 100px)' }}
        allow="autoplay"
        onError={() => console.error('Iframe failed to load')}
      />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/play" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

