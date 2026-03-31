import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─── helpers ─────────────────────────────────────────────── */
const today = () => new Date().toISOString().split('T')[0];

const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR'); }
    catch { return d; }
};

const formatMoney = (n) => {
    const val = parseFloat(n || 0).toFixed(2);
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(',') + ' DH';
};

const autoNumero = (factures, offset = 0) => {
    const year = new Date().getFullYear();
    const max = factures
        .map(f => {
            const m = f.numero_facture?.match(/(\d+)$/);
            return m ? parseInt(m[1]) : 0;
        })
        .reduce((a, b) => Math.max(a, b), 0);
    return `${year}-${String(max + 1 + offset).padStart(4, '0')}`;
};

/* ─── PDF generator (Modèle Excel) ─────────────────────────── */
const buildPDF = (facture, receptions, fournisseurNom, fournisseurCIN) => {
    const doc = new jsPDF();

    // Calculs agrégés par qualité
    const agg = {
        A: { nb: 0, poids: 0, prix: 0 },
        B: { nb: 0, poids: 0, prix: 0 },
        C: { nb: 0, poids: 0, prix: 0 },
        TR: { nb: 0, poids: 0, prix: 0 }
    };

    receptions.forEach(r => {
        agg.A.nb += parseInt(r.nb_a || 0);
        agg.A.poids += parseFloat(r.poids_a || 0);
        agg.A.prix = parseFloat(r.prix_a || agg.A.prix || 0);

        agg.B.nb += parseInt(r.nb_b || 0);
        agg.B.poids += parseFloat(r.poids_b || 0);
        agg.B.prix = parseFloat(r.prix_b || agg.B.prix || 0);

        agg.C.nb += parseInt(r.nb_c || 0);
        agg.C.poids += parseFloat(r.poids_c || 0);
        agg.C.prix = parseFloat(r.prix_c || agg.C.prix || 0);

        agg.TR.nb += parseInt(r.nb_tr || 0);
        agg.TR.poids += parseFloat(r.poids_tr || 0);
        agg.TR.prix = parseFloat(r.prix_tr || agg.TR.prix || 0);
    });

    // Header
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('FACTURE PEAUX BRUTES', 105, 25, { align: 'center' });

    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    // Infos Gauche
    doc.text(`Fournisseur : ${fournisseurNom}`, 14, 45);
    doc.text(`CIN : ${fournisseurCIN || '—'}`, 14, 52);
    doc.text(`Date : ${formatDate(facture.date_facture)}`, 14, 59);
    doc.text(`N° Facture : ${facture.numero_facture}`, 14, 66);

    // Tableau
    const rows = [
        ['A', agg.A.nb, agg.A.poids.toFixed(2), agg.A.prix.toFixed(2), (agg.A.poids * agg.A.prix).toFixed(2)],
        ['B', agg.B.nb, agg.B.poids.toFixed(2), agg.B.prix.toFixed(2), (agg.B.poids * agg.B.prix).toFixed(2)],
        ['C', agg.C.nb, agg.C.poids.toFixed(2), agg.C.prix.toFixed(2), (agg.C.poids * agg.C.prix).toFixed(2)],
        ['TR', agg.TR.nb, agg.TR.poids.toFixed(2), agg.TR.prix.toFixed(2), (agg.TR.poids * agg.TR.prix).toFixed(2)]
    ];

    const totalNb = agg.A.nb + agg.B.nb + agg.C.nb + agg.TR.nb;
    const totalPoids = agg.A.poids + agg.B.poids + agg.C.poids + agg.TR.poids;
    const totalAmount = (agg.A.poids * agg.A.prix) + (agg.B.poids * agg.B.prix) + (agg.C.poids * agg.C.prix) + (agg.TR.poids * agg.TR.prix);

    autoTable(doc, {
        startY: 75,
        head: [['Catégorie', 'Nombre Peaux', 'Poids (kg)', 'P.U (DH)', 'Total DH']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
        styles: { halign: 'center' },
        columnStyles: {
            4: { halign: 'right' }
        }
    });

    const finalY = doc.lastAutoTable.finalY;

    // Ligne Total
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(245, 245, 245);
    doc.rect(14, finalY, 182, 10, 'F');
    doc.rect(14, finalY, 182, 10, 'S');
    doc.text('TOTAL A PAYER', 20, finalY + 7);
    doc.text(`${totalNb}`, 65, finalY + 7, { align: 'center' });
    doc.text(`${totalPoids.toFixed(2)} kg`, 105, finalY + 7, { align: 'center' });
    doc.text(formatMoney(totalAmount), 190, finalY + 7, { align: 'right' });

    // Pied de page / Signatures
    const footY = finalY + 40;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Service Approvisionnement', 14, footY);
    doc.text('Direction Générale', 150, footY);

    return doc;
};

/* ─── COMPOSANT PRINCIPAL ───────────────────────────────────── */
const FacturesReceptions = () => {
    const [factures, setFactures] = useState([]);
    const [fournisseurs, setFournisseurs] = useState([]);
    const [pendingAll, setPendingAll] = useState([]); // Toutes les réceptions non facturées
    const [selectedPending, setSelectedPending] = useState([]); // IDs sélectionnés dans la liste globale

    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [filterFournisseurHistory, setFilterFournisseurHistory] = useState('');
    const [filterMoisHistory, setFilterMoisHistory] = useState('');

    /* ── Fetch ── */
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Utilisation de Promise.all pour charger tout en parallèle
            const [facts, fours, pending] = await Promise.all([
                api.getFacturesFournisseurs(),
                api.getFournisseurs(),
                api.getReceptionsNonFacturees()
            ]);

            setFactures(Array.isArray(facts) ? facts : []);
            setFournisseurs(Array.isArray(fours) ? fours : []);
            setPendingAll(Array.isArray(pending) ? pending : []);
        } catch (e) {
            console.error(e);
            setMessage({ type: 'danger', text: 'Erreur lors du chargement des données.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Rafraîchir quand la fenêtre regagne le focus (ex: retour d'un autre onglet)
        const onFocus = () => fetchData();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchData]);

    /* ── Groupement par fournisseur ── */
    const groupedPending = Array.isArray(pendingAll) ? pendingAll.reduce((acc, r) => {
        const id = r.fournisseur_id;
        if (!acc[id]) acc[id] = { nom: r.fournisseur_nom, cin: r.fournisseur_cin, items: [] };
        acc[id].items.push(r);
        return acc;
    }, {}) : {};

    /* ── Checkbox logic ── */
    const togglePending = (id) =>
        setSelectedPending(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );

    const toggleGroup = (supplierId) => {
        if (!groupedPending[supplierId]) return;
        const groupItems = groupedPending[supplierId].items.map(r => r.id);
        const allSelected = groupItems.every(id => selectedPending.includes(id));
        if (allSelected) {
            setSelectedPending(prev => prev.filter(id => !groupItems.includes(id)));
        } else {
            setSelectedPending(prev => [...new Set([...prev, ...groupItems])]);
        }
    };

    /* ── Facturer la sélection (Multi-fournisseurs) ── */
    const handleFacturerMulti = async () => {
        if (selectedPending.length === 0 || !Array.isArray(pendingAll)) return;

        const selection = pendingAll.filter(r => selectedPending.includes(r.id));
        const bySupplier = selection.reduce((acc, r) => {
            if (!acc[r.fournisseur_id]) acc[r.fournisseur_id] = [];
            acc[r.fournisseur_id].push(r);
            return acc;
        }, {});

        const confirmCount = Object.keys(bySupplier).length;
        if (!window.confirm(`Vous allez générer ${confirmCount} facture(s). Continuer ?`)) return;

        try {
            let offset = 0;
            const currentFactures = await api.getFacturesFournisseurs().catch(() => []);

            for (const [fournId, items] of Object.entries(bySupplier)) {
                const totalAmount = items.reduce((s, r) => s + parseFloat(r.poids_kg || 0) * parseFloat(r.prix_unitaire_kg || 0), 0);
                const num = autoNumero(currentFactures, offset);
                const fournisseurNom = items[0].fournisseur_nom;
                const fournisseurCIN = items[0].fournisseur_cin;

                const payload = {
                    fournisseur_id: parseInt(fournId),
                    numero_facture: num,
                    date_facture: today(),
                    montant_total: totalAmount,
                    reception_ids: items.map(r => r.id)
                };

                const result = await api.addFactureFournisseur(payload);
                if (result?.error) throw new Error(`${fournisseurNom}: ${result.error}`);

                // PDF
                const doc = buildPDF({ numero_facture: num, date_facture: today() }, items, fournisseurNom, fournisseurCIN);
                doc.save(`Facture_${num}_${fournisseurNom.replace(/\s+/g, '_')}.pdf`);

                offset++;
            }

            setMessage({ type: 'success', text: `✅ ${confirmCount} facture(s) générée(s) avec succès !` });
            setSelectedPending([]);
            fetchData();
        } catch (err) {
            setMessage({ type: 'danger', text: err.message });
        }
    };

    /* ── Historique Handlers ── */
    const handleStatusChange = async (factureId, statut) => {
        try {
            await api.updateFactureStatut(factureId, statut);
            const data = await api.getFacturesFournisseurs();
            setFactures(data || []);
        } catch (e) {
            setMessage({ type: 'danger', text: 'Erreur changement de statut.' });
        }
    };

    const handleDeleteFacture = async (id) => {
        if (!window.confirm("Supprimer cette facture ? Les réceptions redeviendront 'En attente'.")) return;
        try {
            await api.deleteFactureFournisseur(id);
            setMessage({ type: 'success', text: 'Facture supprimée.' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'danger', text: 'Erreur suppression.' });
        }
    };

    const handleRegeneratePDF = async (facture) => {
        setPdfLoading(facture.id);
        try {
            const receptions = await api.getInvoiceReceptions(facture.id);
            if (!receptions || receptions.length === 0) return;
            const doc = buildPDF(facture, receptions, facture.fournisseur_nom, facture.fournisseur_cin);
            doc.save(`Facture_${facture.numero_facture}.pdf`);
        } catch (err) {
            console.error(err);
        } finally {
            setPdfLoading(null);
        }
    };

    const facturesFiltrees = factures.filter(f => {
        const matchFourn = !filterFournisseurHistory || f.fournisseur_id == filterFournisseurHistory;
        const matchMois = !filterMoisHistory || f.date_facture?.startsWith(filterMoisHistory);
        return matchFourn && matchMois;
    });

    const statutColor = { payee: '#28a745', envoyee: '#17a2b8', en_attente: '#ffc107' };

    if (loading && factures.length === 0) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px', color: '#666' }}>Chargement en cours...</div>;

    return (
        <div className="container" style={{ paddingBottom: '30px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <h1 style={{ color: '#1a659e', fontWeight: 'bold', margin: 0 }}>Gestion Facturation Peaux</h1>
                    {loading && <span className="ml-3 text-muted" style={{ fontSize: '14px' }}>Actualisation en cours...</span>}
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary" onClick={fetchData} title="Rafraîchir les données" disabled={loading}>
                        {loading ? '⏳' : '🔄'} Actualiser
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type} shadow-sm`} style={{ borderRadius: '10px', fontWeight: 'bold' }}>
                    {message.text}
                </div>
            )}

            {/* ── SECTION RÉCEPTIONS EN ATTENTE ── */}
            <div className="card shadow-sm mb-5" style={{ borderRadius: '12px', border: 'none' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center" style={{ borderRadius: '12px 12px 0 0' }}>
                    <h5 className="mb-0" style={{ fontWeight: 'bold', color: '#1a659e' }}>
                        📥 Réceptions Reçues — Non Facturées
                    </h5>
                    {selectedPending.length > 0 && (
                        <button className="btn btn-primary shadow-sm" onClick={handleFacturerMulti} style={{ fontWeight: 'bold' }}>
                            📄 Facturer la sélection ({selectedPending.length})
                        </button>
                    )}
                </div>
                <div className="card-body p-0">
                    {Object.keys(groupedPending).length === 0 ? (
                        <div className="p-5 text-center text-muted">Tout est à jour ! Aucune réception en attente.</div>
                    ) : (
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            {Object.entries(groupedPending).map(([fId, group]) => {
                                const selectedInGroup = group.items.filter(r => selectedPending.includes(r.id)).length;
                                const isAllSelected = selectedInGroup === group.items.length;
                                return (
                                    <div key={fId} className="border-bottom">
                                        <div
                                            style={{ background: '#f8f9ff', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                            onClick={() => toggleGroup(fId)}
                                        >
                                            <input type="checkbox" checked={isAllSelected} onChange={() => { }} onClick={e => e.stopPropagation()} style={{ marginRight: '15px', scale: '1.2' }} />
                                            <span style={{ fontWeight: 'bold', color: '#333' }}>{group.nom}</span>
                                            {group.cin && <span className="text-muted ml-2" style={{ fontSize: '12px' }}>({group.cin})</span>}
                                            <span className="badge badge-secondary ml-3">{group.items.length} réception(s)</span>
                                            {selectedInGroup > 0 && <span className="badge badge-primary ml-2">{selectedInGroup} sélectionnée(s)</span>}
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-sm table-hover mb-0" style={{ fontSize: '13px' }}>
                                                <thead>
                                                    <tr className="text-muted">
                                                        <th style={{ width: '50px' }}></th>
                                                        <th>N° Réception</th>
                                                        <th>Date</th>
                                                        <th>Poids</th>
                                                        <th>Montant</th>
                                                        <th>Statut</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.items.map(r => (
                                                        <tr
                                                            key={r.id}
                                                            onClick={() => togglePending(r.id)}
                                                            style={{ cursor: 'pointer', background: selectedPending.includes(r.id) ? '#e8f4fd' : 'transparent' }}
                                                        >
                                                            <td className="text-center">
                                                                <input type="checkbox" checked={selectedPending.includes(r.id)} onChange={() => { }} style={{ scale: '1.1' }} />
                                                            </td>
                                                            <td><strong>{r.numero_entree || r.reference_suivi}</strong></td>
                                                            <td>{formatDate(r.date_reception)}</td>
                                                            <td>{parseFloat(r.poids_kg || 0).toFixed(2)} kg</td>
                                                            <td style={{ fontWeight: 'bold' }}>{formatMoney(parseFloat(r.poids_kg || 0) * parseFloat(r.prix_unitaire_kg || 0))}</td>
                                                            <td><span className="badge badge-warning">En attente</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── HISTORIQUE DES FACTURES ── */}
            <div className="card shadow-sm" style={{ borderRadius: '12px', border: 'none' }}>
                <div className="card-header bg-white py-3" style={{ borderRadius: '12px 12px 0 0' }}>
                    <div className="row align-items-center">
                        <div className="col-md-4">
                            <h5 className="mb-0" style={{ fontWeight: 'bold', color: '#1a659e' }}>📊 Historique des Factures</h5>
                        </div>
                        <div className="col-md-8 d-flex gap-2 justify-content-end">
                            <select className="form-control form-control-sm w-auto" value={filterFournisseurHistory} onChange={e => setFilterFournisseurHistory(e.target.value)}>
                                <option value="">Tous les fournisseurs</option>
                                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                            </select>
                            <input type="month" className="form-control form-control-sm w-auto" value={filterMoisHistory} onChange={e => setFilterMoisHistory(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>N° Facture</th>
                                <th>Fournisseur</th>
                                <th>Date</th>
                                <th>Montant Total</th>
                                <th>Statut</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facturesFiltrees.length === 0 ? (
                                <tr><td colSpan="6" className="text-center p-4 text-muted">Aucune facture trouvée.</td></tr>
                            ) : (
                                facturesFiltrees.map(f => (
                                    <tr key={f.id} style={{ verticalAlign: 'middle' }}>
                                        <td><strong>{f.numero_facture}</strong></td>
                                        <td>{f.fournisseur_nom}</td>
                                        <td>{formatDate(f.date_facture)}</td>
                                        <td style={{ fontWeight: 'bold', color: '#1a659e' }}>{formatMoney(f.montant_total)}</td>
                                        <td>
                                            <select
                                                value={f.statut}
                                                onChange={e => handleStatusChange(f.id, e.target.value)}
                                                style={{
                                                    border: `2px solid ${statutColor[f.statut]}`,
                                                    borderRadius: '20px',
                                                    padding: '2px 12px',
                                                    fontWeight: 'bold',
                                                    fontSize: '12px',
                                                    color: statutColor[f.statut]
                                                }}
                                            >
                                                <option value="en_attente">En attente</option>
                                                <option value="envoyee">Envoyée</option>
                                                <option value="payee">Payée</option>
                                            </select>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="btn-group">
                                                <button className="btn btn-sm btn-outline-info" onClick={() => handleRegeneratePDF(f)} disabled={pdfLoading === f.id}>
                                                    {pdfLoading === f.id ? '...' : '📄 PDF'}
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteFacture(f.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-light" style={{ fontWeight: 'bold' }}>
                            <tr>
                                <td colSpan={3} className="text-right">TOTAL</td>
                                <td style={{ color: '#1a659e' }}>{formatMoney(facturesFiltrees.reduce((s, f) => s + parseFloat(f.montant_total || 0), 0))}</td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacturesReceptions;
