import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import RecordForm from './pages/RecordForm';
import RecordDetail from './pages/RecordDetail';
import RecordPrint from './pages/RecordPrint';
import Calendar from './pages/Calendar';
import Vaccinations from './pages/Vaccinations';
import Growth from './pages/Growth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/me', { withCredentials: true });
        setUser(res.data);
      } catch (err) {
        // Not logged in
        console.log("Not logged in");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Načítám...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />

        <Route element={user ? <Layout onLogout={() => setUser(null)} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/record/:id" element={<RecordDetail />} />
          <Route path="/add" element={<RecordForm />} />
          <Route path="/edit/:id" element={<RecordForm />} />
          <Route path="/record/:id/print" element={<RecordPrint />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/vaccinations" element={<Vaccinations />} />
          <Route path="/growth" element={<Growth />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
