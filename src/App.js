import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './Landing';
import Chat from './Chat';
import HealthChecker from './HealthChecker';
import LogIn from './LogIn';
import { AuthProvider } from './AuthProvider';
import UserAuthentication from './UserAuthentication';
import Walkthrough from './Walkthrough';
import SampleLanding from './SampleLanding';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/Home" element={<Landing />} />
          <Route path="/Chat" element={<Chat />} />
          <Route path="/Walkthrough" element={<Walkthrough />} />
          <Route path="/Health Checker" element={<HealthChecker />} />
          <Route path="/Log In" element={<UserAuthentication />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
