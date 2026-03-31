import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Navigation.css';

const Navigation = ({ session }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button className="menu-toggle" onClick={toggleMenu}>
        {isOpen ? '✕' : '☰'}
      </button>
      <nav className={`navigation ${isOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <h1>Gestion de Teinture Marocaine</h1>
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>Tableau de bord</Link>
          </li>
          <li className="nav-item">
            <Link to="/commandes" className="nav-link" onClick={closeMenu}>Commandes</Link>
          </li>
          <li className="nav-item">
            <Link to="/clients" className="nav-link" onClick={closeMenu}>Clients</Link>
          </li>
          <li className="nav-item">
            <Link to="/receptions" className="nav-link" onClick={closeMenu}>Réceptions Peaux</Link>
          </li>
          <li className="nav-item">
            <Link to="/fournisseurs" className="nav-link" onClick={closeMenu}>Fournisseurs</Link>
          </li>
          <li className="nav-item">
            <Link to="/achats-chimiques" className="nav-link" onClick={closeMenu}>Achats Chimiques</Link>
          </li>
          <li className="nav-item">
            <Link to="/stock" className="nav-link" onClick={closeMenu}>Stock Produits</Link>
          </li>
          <li className="nav-item">
            <Link to="/production" className="nav-link" onClick={closeMenu}>Traitement & Production</Link>
          </li>
          <li className="nav-item">
            <Link to="/formules" className="nav-link" onClick={closeMenu}>Formules de Production</Link>
          </li>
          <li className="nav-item">
            <Link to="/produits" className="nav-link" onClick={closeMenu}>Catalogue Produits</Link>
          </li>
          <li className="nav-item">
            <Link to="/factures-receptions" className="nav-link" onClick={closeMenu}>Facturation Peaux</Link>
          </li>
        </ul>
        <div className="nav-footer">
          <div className="user-info">
            <span>{session.user.email}</span>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>Déconnexion</button>
        </div>
      </nav>
      {isOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </>
  );
};

export default Navigation;
