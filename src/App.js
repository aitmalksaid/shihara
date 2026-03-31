import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { supabase } from './supabase';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Commandes from './components/Commandes';
import Clients from './components/Clients';
import Receptions from './components/Receptions';
import Fournisseurs from './components/Fournisseurs';
import AchatsChimiques from './components/AchatsChimiques';
import StockChimique from './components/StockChimique';
import ProduitsChimiques from './components/ProduitsChimiques';
import FacturesReceptions from './components/FacturesReceptions';
import Productions from './components/Productions';
import Formules from './components/Formules';
import Login from './components/Login';
import './App.css';

function App() {
  const [session, setSession] = useState({ user: { email: 'admin@local' } });
  const [loading, setLoading] = useState(false);

  // Authentification désactivée pour le local
  return (
    <Router>
      <div className="app">
        {session ? (
          <>
            <Navigation session={session} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/commandes" element={<Commandes />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/receptions" element={<Receptions />} />
                <Route path="/fournisseurs" element={<Fournisseurs />} />
                <Route path="/achats-chimiques" element={<AchatsChimiques />} />
                <Route path="/stock" element={<StockChimique />} />
                <Route path="/produits" element={<ProduitsChimiques />} />
                <Route path="/factures-receptions" element={<FacturesReceptions />} />
                <Route path="/production" element={<Productions />} />
                <Route path="/formules" element={<Formules />} />
              </Routes>
            </main>
          </>
        ) : (
          <Login />
        )}
      </div>
    </Router>
  );
}

export default App;
