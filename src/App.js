import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './Landing';
import Chat from './Chat';
import HealthChecker from './HealthChecker';
import LogIn from './LogIn';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Home" element={<Landing />} />
        <Route path="/Chat" element={<Chat />} />
        <Route path="/Health Checker" element={<HealthChecker />} />
        <Route path="/Log In" element={<LogIn />} />
      </Routes>
    </Router>
  );
}

export default App;
