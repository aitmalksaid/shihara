import React, { useState, useEffect } from 'react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAchats, setRecentAchats] = useState([]);
  const [recentReceptions, setRecentReceptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [achatsData, receptionsData, produitsData, prodData] = await Promise.all([
          api.getAchatsChimiques().catch(() => []),
          api.getReceptions().catch(() => []),
          api.getProduitsChimiques().catch(() => []),
          api.getProductionsDetails().catch(() => []),
        ]);

        const achats = Array.isArray(achatsData) ? achatsData : [];
        const receptions = Array.isArray(receptionsData) ? receptionsData : [];
        const produits = Array.isArray(produitsData) ? produitsData : [];
        const productions = Array.isArray(prodData) ? prodData : [];

        // Stats peaux
        const totalPoidsRecu = receptions.reduce((s, r) => s + parseFloat(r.poids_kg || 0), 0);
        const totalMontantPeaux = receptions.reduce((s, r) => s + (parseFloat(r.poids_kg || 0) * parseFloat(r.prix_unitaire_kg || 0)), 0);
        const receptionsNonFacturees = receptions.filter(r => !r.facture_generee || r.facture_generee === 0);
        const poidsNonFacture = receptionsNonFacturees.reduce((s, r) => s + parseFloat(r.poids_kg || 0), 0);

        // Stats chimiques
        const totalAchatsChimiques = achats.reduce((s, a) => s + parseFloat(a.ttc || 0), 0);
        const nbImport = achats.filter(a => a.type_achat === 'IMPORT').length;
        const nbLocal = achats.filter(a => a.type_achat === 'LOCAL').length;
        const montantImport = achats.filter(a => a.type_achat === 'IMPORT').reduce((s, a) => s + parseFloat(a.ttc || 0), 0);
        const montantLocal = achats.filter(a => a.type_achat === 'LOCAL').reduce((s, a) => s + parseFloat(a.ttc || 0), 0);

        // Dernier mois
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const achatsMoisActuel = achats.filter(a => a.date_commande && new Date(a.date_commande) >= firstDayOfMonth);
        const receptionsMoisActuel = receptions.filter(r => r.date_reception && new Date(r.date_reception) >= firstDayOfMonth);

        setStats({
          // Peaux
          totalReceptions: receptions.length,
          totalPoidsRecu,
          totalMontantPeaux,
          receptionsNonFacturees: receptionsNonFacturees.length,
          poidsNonFacture,
          receptionsMois: receptionsMoisActuel.length,
          poidsMois: receptionsMoisActuel.reduce((s, r) => s + parseFloat(r.poids_kg || 0), 0),
          // Chimiques
          totalAchats: achats.length,
          totalAchatsChimiques,
          nbProduits: produits.length,
          nbImport,
          nbLocal,
          montantImport,
          montantLocal,
          achatsMois: achatsMoisActuel.length,
          montantMois: achatsMoisActuel.reduce((s, a) => s + parseFloat(a.ttc || 0), 0),
          // Production
          totalProductions: productions.length,
          poidsTotalTraite: productions.reduce((s, p) => s + parseFloat(p.poids_base || 0), 0),
          productionsMois: productions.filter(p => p.date_production && new Date(p.date_production) >= firstDayOfMonth).length,
        });

        setRecentAchats(achats.slice(0, 5));
        setRecentReceptions(receptions.slice(0, 5));
      } catch (error) {
        console.error('Erreur dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid #e2e8f0',
            borderTop: '4px solid #3182ce', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: '#718096' }}>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div style={{ padding: '0 8px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2d3748', marginBottom: '6px' }}>
        📊 Tableau de bord
      </h1>
      <p style={{ color: '#718096', marginBottom: '24px', fontSize: '0.9rem' }}>
        Vue d'ensemble — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* ===== SECTION PEAUX ===== */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          borderLeft: '4px solid #38a169', paddingLeft: '10px',
          marginBottom: '14px'
        }}>
          <span style={{ fontSize: '1.3rem' }}>🐑</span>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#276749' }}>
            Réceptions de Peaux
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <StatCard
            value={`${(s.totalPoidsRecu || 0).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`}
            label="Total peaux reçues"
            sub={`${s.totalReceptions || 0} réceptions`}
            color="#38a169" bg="#f0fff4"
            icon="⚖️"
          />
          <StatCard
            value={`${(s.poidsMois || 0).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`}
            label="Ce mois-ci"
            sub={`${s.receptionsMois || 0} réceptions`}
            color="#2f855a" bg="#c6f6d5"
            icon="📅"
          />
          <StatCard
            value={`${(s.poidsNonFacture || 0).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`}
            label="Non facturées"
            sub={`${s.receptionsNonFacturees || 0} réceptions en attente`}
            color="#dd6b20" bg="#fffaf0"
            icon="⏳"
          />
          <StatCard
            value={`${(s.totalMontantPeaux || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`}
            label="Valeur totale peaux"
            sub="montant cumulé"
            color="#2b6cb0" bg="#ebf8ff"
            icon="💰"
          />
        </div>
      </div>

      {/* ===== SECTION CHIMIQUES ===== */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          borderLeft: '4px solid #3182ce', paddingLeft: '10px',
          marginBottom: '14px'
        }}>
          <span style={{ fontSize: '1.3rem' }}>🧪</span>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2c5282' }}>
            Achats Produits Chimiques
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <StatCard
            value={`${(s.totalAchatsChimiques || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`}
            label="Total achats chimiques"
            sub={`${s.totalAchats || 0} entrées`}
            color="#3182ce" bg="#ebf8ff"
            icon="🧾"
          />
          <StatCard
            value={`${(s.montantMois || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`}
            label="Ce mois-ci"
            sub={`${s.achatsMois || 0} achats`}
            color="#6b46c1" bg="#faf5ff"
            icon="📅"
          />
          <StatCard
            value={`${(s.montantImport || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`}
            label="Total IMPORT"
            sub={`${s.nbImport || 0} achats import`}
            color="#00a3c4" bg="#e6fffa"
            icon="🌍"
          />
          <StatCard
            value={`${(s.montantLocal || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`}
            label="Total LOCAL"
            sub={`${s.nbLocal || 0} achats local`}
            color="#d69e2e" bg="#fffff0"
            icon="🏭"
          />
        </div>

        {/* Barre répartition Import / Local */}
        {(s.totalAchats || 0) > 0 && (
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
            padding: '16px 20px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.9rem' }}>
                🌍 IMPORT : {s.nbImport} ({((s.nbImport / s.totalAchats) * 100).toFixed(0)}%)
              </span>
              <span style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.9rem' }}>
                🏭 LOCAL : {s.nbLocal} ({((s.nbLocal / s.totalAchats) * 100).toFixed(0)}%)
              </span>
            </div>
            <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '12px', overflow: 'hidden' }}>
              <div style={{
                width: `${(s.nbImport / s.totalAchats) * 100}%`,
                background: 'linear-gradient(90deg, #00a3c4, #3182ce)',
                height: '100%', borderRadius: '99px', transition: 'width 0.6s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: '#00a3c4', fontWeight: 600 }}>
                {(s.montantImport || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
              </span>
              <span style={{ fontSize: '0.78rem', color: '#d69e2e', fontWeight: 600 }}>
                {(s.montantLocal || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ===== SECTION PRODUCTION ===== */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          borderLeft: '4px solid #6b46c1', paddingLeft: '10px',
          marginBottom: '14px'
        }}>
          <span style={{ fontSize: '1.3rem' }}>⚙️</span>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#44337a' }}>
            Production & Traitement
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <StatCard
            value={`${s.totalProductions || 0} lots`}
            label="Total productions"
            sub="historique complet"
            color="#6b46c1" bg="#faf5ff"
            icon="🏭"
          />
          <StatCard
            value={`${(s.poidsTotalTraite || 0).toLocaleString('fr-FR', { minimumFractionDigits: 1 })} kg`}
            label="Poids total traité"
            sub="base de calcul stock"
            color="#805ad5" bg="#f3e8ff"
            icon="⚖️"
          />
          <StatCard
            value={`${s.productionsMois || 0} lots`}
            label="Ce mois-ci"
            sub="activité récente"
            color="#553c9a" bg="#e9d8fd"
            icon="📅"
          />
        </div>
      </div>

      {/* ===== TABLEAUX RÉCENTS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Derniers achats chimiques */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
          overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3182ce, #2c5282)',
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span>🧪</span>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
              Derniers achats chimiques
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Désignation</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentAchats.length > 0 ? recentAchats.map((a, i) => (
                <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#f7fafc' }}>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                      background: a.type_achat === 'IMPORT' ? '#bee3f8' : '#c6f6d5',
                      color: a.type_achat === 'IMPORT' ? '#2b6cb0' : '#276749'
                    }}>{a.type_achat}</span>
                  </td>
                  <td style={tdStyle}>{a.designation_commande || a.designation_reception || '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#2d3748' }}>
                    {a.ttc ? parseFloat(a.ttc).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH' : '-'}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#a0aec0' }}>Aucun achat</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dernières réceptions peaux */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
          overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #38a169, #276749)',
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span>🐑</span>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
              Dernières réceptions peaux
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Fournisseur</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Poids</th>
              </tr>
            </thead>
            <tbody>
              {recentReceptions.length > 0 ? recentReceptions.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f7fafc' }}>
                  <td style={tdStyle}>{r.date_reception ? new Date(r.date_reception).toLocaleDateString('fr-FR') : '-'}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{r.fournisseur_nom || '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#276749' }}>
                    {parseFloat(r.poids_kg || 0).toLocaleString('fr-FR', { minimumFractionDigits: 1 })} kg
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#a0aec0' }}>Aucune réception</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div >
  );
};

const thStyle = {
  padding: '8px 12px', textAlign: 'left', fontWeight: 700,
  color: '#4a5568', fontSize: '0.78rem', textTransform: 'uppercase',
  borderBottom: '2px solid #e2e8f0'
};

const tdStyle = {
  padding: '8px 12px', color: '#4a5568',
  borderBottom: '1px solid #edf2f7'
};

const StatCard = ({ value, label, sub, color, bg, icon }) => (
  <div style={{
    background: bg, border: `1px solid ${color}30`,
    borderRadius: '12px', padding: '16px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    cursor: 'default'
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
  >
    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{icon}</div>
    <div style={{ fontSize: '1.35rem', fontWeight: 800, color, lineHeight: 1.2 }}>{value}</div>
    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2d3748', marginTop: '4px' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '2px' }}>{sub}</div>}
  </div>
);

export default Dashboard;
