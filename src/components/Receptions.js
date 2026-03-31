import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/* ─── helpers ───────────────────────────────────────────── */
const fmt = (d) => { try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d || '—'; } };
const todayStr = () => new Date().toISOString().split('T')[0];
const genRef = () => `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

/* ─── PDF : Fiche Réception Individuelle ────────────────── */
const printFicheReception = (r) => {
    const doc = new jsPDF();
    const blue = [26, 101, 158];
    const fmt = (d) => { try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d || '—'; } };

    // Header simple imitant la fiche
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('SHIHARA TANNERY', 14, 15);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text('Direction Technique', 14, 20);
    doc.text('Fiche Mise en Rale Sélection Peaux Brutes', 14, 24);

    // Date box
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text(fmt(r.date_reception), 196, 15, { align: 'right' });
    doc.setLineWidth(0.5); doc.line(140, 18, 196, 18);

    // Infos générales
    doc.setDrawColor(200); doc.rect(14, 32, 182, 38);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('N° Entrée :', 20, 42); doc.setFont('helvetica', 'normal'); doc.text(r.numero_entree || r.reference_suivi || '—', 55, 42);
    doc.setFont('helvetica', 'bold'); doc.text('Date Entrée :', 20, 50); doc.setFont('helvetica', 'normal'); doc.text(fmt(r.date_reception), 55, 50);
    doc.setFont('helvetica', 'bold'); doc.text('Provenance :', 20, 58); doc.setFont('helvetica', 'normal'); doc.text(r.fournisseur_nom || '—', 55, 58);

    // Bloc Peaux / Ecart
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...blue);
    doc.text('DONNÉES DE RÉCEPTION', 14, 82);
    doc.setDrawColor(...blue); doc.line(14, 84, 196, 84);

    doc.setFontSize(10); doc.setTextColor(0);
    doc.text(`Nombre Peaux Reçues (Global) :  ${r.nombre_peaux != null ? r.nombre_peaux : '—'}`, 14, 92);
    doc.setFont('helvetica', 'bold'); doc.text(`Écart : ${r.ecart || '0'}`, 140, 92);
    doc.setDrawColor(0); doc.rect(175, 86, 12, 10); // Carreau vide pour vérification locale

    // Grille A, B, C, TR
    const tableData = [
        ['Qualité', 'Nb Peaux', 'Poids (kg)', 'Prix /kg', 'Valeur'],
        ['A', r.nb_a || '0', parseFloat(r.poids_a || 0).toFixed(2), parseFloat(r.prix_a || 0).toFixed(2) + ' DH', (parseFloat(r.poids_a || 0) * parseFloat(r.prix_a || 0)).toFixed(2) + ' DH'],
        ['B', r.nb_b || '0', parseFloat(r.poids_b || 0).toFixed(2), parseFloat(r.prix_b || 0).toFixed(2) + ' DH', (parseFloat(r.poids_b || 0) * parseFloat(r.prix_b || 0)).toFixed(2) + ' DH'],
        ['C', r.nb_c || '0', parseFloat(r.poids_c || 0).toFixed(2), parseFloat(r.prix_c || 0).toFixed(2) + ' DH', (parseFloat(r.poids_c || 0) * parseFloat(r.prix_c || 0)).toFixed(2) + ' DH'],
        ['TR', r.nb_tr || '0', parseFloat(r.poids_tr || 0).toFixed(2), parseFloat(r.prix_tr || 0).toFixed(2) + ' DH', (parseFloat(r.poids_tr || 0) * parseFloat(r.prix_tr || 0)).toFixed(2) + ' DH'],
        [{ content: 'TOTAL SÉLECTION', colSpan: 1, styles: { halign: 'right', fontStyle: 'bold' } },
        (parseInt(r.nb_a || 0) + parseInt(r.nb_b || 0) + parseInt(r.nb_c || 0) + parseInt(r.nb_tr || 0)),
        parseFloat(r.poids_kg || 0).toFixed(2) + ' kg',
            '',
        { content: ((parseFloat(r.poids_a || 0) * parseFloat(r.prix_a || 0)) + (parseFloat(r.poids_b || 0) * parseFloat(r.prix_b || 0)) + (parseFloat(r.poids_c || 0) * parseFloat(r.prix_c || 0)) + (parseFloat(r.poids_tr || 0) * parseFloat(r.prix_tr || 0))).toFixed(2) + ' DH', styles: { halign: 'right', fontStyle: 'bold' } }
        ]
    ];

    autoTable(doc, {
        startY: 98,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: blue, textColor: 255, fontSize: 10, halign: 'center' },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
            0: { fontStyle: 'bold', halign: 'center' },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'right' }
        }
    });

    const totalPeauxSel = (parseInt(r.nb_a || 0) + parseInt(r.nb_b || 0) + parseInt(r.nb_c || 0) + parseInt(r.nb_tr || 0));
    const totalValeur = ((parseFloat(r.poids_a || 0) * parseFloat(r.prix_a || 0)) + (parseFloat(r.poids_b || 0) * parseFloat(r.prix_b || 0)) + (parseFloat(r.poids_c || 0) * parseFloat(r.prix_c || 0)) + (parseFloat(r.poids_tr || 0) * parseFloat(r.prix_tr || 0)));
    const totalPoids = parseFloat(r.poids_kg || 0);

    const ratioPrixPeau = totalPeauxSel > 0 ? (totalValeur / totalPeauxSel).toFixed(2) : '0.00';
    const ratioKgPeau = totalPeauxSel > 0 ? (totalPoids / totalPeauxSel).toFixed(3) : '0.000';

    const lastY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(`Prix /Peau : ${ratioPrixPeau} DH`, 14, lastY);
    doc.text(`Kg /Peau : ${ratioKgPeau} kg`, 80, lastY);

    const finalY = lastY + 25;

    // Signatures
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('SHIHARA', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text('RECEPTION PEAUX BRUTES', 14, finalY + 6);
    doc.text('NOM : ________________________', 14, finalY + 14);
    doc.text(`DATE : ${fmt(new Date())}`, 14, finalY + 22);

    doc.save(`Fiche_Reception_${r.numero_entree?.replace(/\//g, '_') || r.reference_suivi}.pdf`);
};

/* ─── COMPOSANT ─────────────────────────────────────────── */
const Receptions = () => {
    const [receptions, setReceptions] = useState([]);
    const [fournisseurs, setFournisseurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedReception, setSelectedReception] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        fournisseur_id: '', numero_entree_prefix: '',
        date_reception: todayStr(), statut_paiement: 'en_attente',
        nombre_peaux_global: '', ecart_global: '0',
        poids_kg: '0', prix_unitaire_kg: '6.00',
        nb_a: '', nb_b: '', nb_c: '', nb_tr: '',
        poids_a: '', poids_b: '', poids_c: '', poids_tr: '',
        prix_a: '6.00', prix_b: '6.00', prix_c: '6.00', prix_tr: '3.00'
    });

    const fetchReceptions = useCallback(async () => {
        try {
            const data = await api.getReceptions();
            setReceptions(data || []);
        } catch { setMessage({ type: 'danger', text: 'Erreur chargement réceptions' }); }
        finally { setLoading(false); }
    }, []);

    const fetchFournisseurs = useCallback(async () => {
        try {
            const allSuppliers = await api.getFournisseurs();
            // Filtrer pour n'afficher que les fournisseurs 'Peaux'
            const skinSuppliers = (allSuppliers || []).filter(f => f.categorie === 'Peaux');
            setFournisseurs(skinSuppliers);
        } catch { }
    }, []);

    useEffect(() => { fetchReceptions(); fetchFournisseurs(); }, [fetchReceptions, fetchFournisseurs]);

    // Calcul automatique de l'écart et du poids total
    useEffect(() => {
        const global = parseInt(formData.nombre_peaux_global) || 0;
        const sumABC = (parseInt(formData.nb_a) || 0) + (parseInt(formData.nb_b) || 0) + (parseInt(formData.nb_c) || 0) + (parseInt(formData.nb_tr) || 0);
        const ecart = sumABC - global;

        const sumPoids = (parseFloat(formData.poids_a) || 0) + (parseFloat(formData.poids_b) || 0) + (parseFloat(formData.poids_c) || 0) + (parseFloat(formData.poids_tr) || 0);

        const totalVal = (parseFloat(formData.poids_a || 0) * parseFloat(formData.prix_a || 0)) +
            (parseFloat(formData.poids_b || 0) * parseFloat(formData.prix_b || 0)) +
            (parseFloat(formData.poids_c || 0) * parseFloat(formData.prix_c || 0)) +
            (parseFloat(formData.poids_tr || 0) * parseFloat(formData.prix_tr || 0));

        const avgPrix = sumPoids > 0 ? totalVal / sumPoids : 6.00;

        const updates = {};
        if (formData.ecart_global !== ecart.toString()) updates.ecart_global = ecart.toString();
        if (formData.poids_kg !== sumPoids.toString()) updates.poids_kg = sumPoids.toString();
        if (formData.prix_unitaire_kg !== avgPrix.toFixed(2)) updates.prix_unitaire_kg = avgPrix.toFixed(2);

        if (Object.keys(updates).length > 0) {
            setFormData(prev => ({ ...prev, ...updates }));
        }
    }, [formData.nombre_peaux_global, formData.nb_a, formData.nb_b, formData.nb_c, formData.nb_tr, formData.poids_a, formData.poids_b, formData.poids_c, formData.poids_tr, formData.prix_a, formData.prix_b, formData.prix_c, formData.prix_tr]);

    /* ── EXPORTER VERS EXCEL ── */
    const handleExportExcel = () => {
        if (receptions.length === 0) return;
        const wb = XLSX.utils.book_new();
        const grouped = receptions.reduce((acc, r) => {
            const name = r.fournisseur_nom || 'Inconnu';
            if (!acc[name]) acc[name] = [];
            acc[name].push(r);
            return acc;
        }, {});

        Object.keys(grouped).forEach(fournisseurNom => {
            const data = grouped[fournisseurNom];
            const cin = data[0]?.fournisseur_cin || '—';
            const aoa = [
                [],
                ["", "", "", "", "", "", fournisseurNom.toUpperCase()],
                [],
                [],
                ["CIN:", cin],
                [],
                ["N reception", "Date Reception", "Qte", "Ecart", "Choix", "MAL Nb", "MAL Poids", "PRIX", "Val/Choix", "Total", "Prix/peaux", "Poids/Peau"],
                ["", "", "", "", "", "", "", "", "", "", "", ""]
            ];

            let startDataRow = aoa.length;
            const merges = [
                { s: { r: 1, c: 6 }, e: { r: 2, c: 9 } }
            ];

            data.forEach((r) => {
                const qualities = [
                    { label: 'A', nb: r.nb_a, p: r.poids_a, pr: r.prix_a },
                    { label: 'B', nb: r.nb_b, p: r.poids_b, pr: r.prix_b },
                    { label: 'C', nb: r.nb_c, p: r.poids_c, pr: r.prix_c },
                    { label: 'TR', nb: r.nb_tr, p: r.poids_tr, pr: r.prix_tr }
                ];
                const rStart = startDataRow;
                qualities.forEach((q, qIdx) => {
                    const val = parseFloat(q.p || 0) * parseFloat(q.pr || 0);
                    const nbPeaux = parseInt(q.nb || 0);
                    aoa.push([
                        qIdx === 0 ? (r.numero_entree || r.reference_suivi) : "",
                        qIdx === 0 ? fmt(r.date_reception) : "",
                        qIdx === 0 ? (r.nombre_peaux || 0) : "",
                        qIdx === 0 ? (r.ecart || 0) : "",
                        q.label,
                        nbPeaux,
                        parseFloat(q.p || 0),
                        parseFloat(q.pr || 0),
                        parseFloat(val.toFixed(2)),
                        parseFloat(val.toFixed(2)),
                        nbPeaux > 0 ? parseFloat((val / nbPeaux).toFixed(2)) : 0,
                        nbPeaux > 0 ? parseFloat((parseFloat(q.p || 0) / nbPeaux).toFixed(3)) : 0
                    ]);
                });
                merges.push({ s: { r: rStart, c: 0 }, e: { r: rStart + 3, c: 0 } });
                merges.push({ s: { r: rStart, c: 1 }, e: { r: rStart + 3, c: 1 } });
                merges.push({ s: { r: rStart, c: 2 }, e: { r: rStart + 3, c: 2 } });
                merges.push({ s: { r: rStart, c: 3 }, e: { r: rStart + 3, c: 3 } });
                startDataRow += 4;
            });

            const ws = XLSX.utils.aoa_to_sheet(aoa);
            ws['!merges'] = merges;
            XLSX.utils.book_append_sheet(wb, ws, fournisseurNom.substring(0, 31).replace(/[\\*?\/\[\]]/g, '_'));
        });
        XLSX.writeFile(wb, `Achats_Peaux_${todayStr()}.xlsx`);
    };

    /* ── Handlers ── */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openNewModal = () => {
        setSelectedReception(null);
        setFormData({
            fournisseur_id: '', numero_entree_prefix: '',
            date_reception: todayStr(), statut_paiement: 'en_attente',
            nombre_peaux_global: '', ecart_global: '0',
            poids_kg: '0', prix_unitaire_kg: '6.00',
            nb_a: '', nb_b: '', nb_c: '', nb_tr: '',
            poids_a: '', poids_b: '', poids_c: '', poids_tr: '',
            prix_a: '6.00', prix_b: '6.00', prix_c: '6.00', prix_tr: '3.00'
        });
        setShowModal(true);
    };

    const openEditModal = (r) => {
        setSelectedReception(r);
        const prefix = r.numero_entree?.split('/')[0] || '';
        setFormData({
            fournisseur_id: r.fournisseur_id,
            numero_entree_prefix: prefix,
            date_reception: r.date_reception ? new Date(r.date_reception).toISOString().split('T')[0] : todayStr(),
            statut_paiement: r.statut_paiement || 'en_attente',
            nombre_peaux_global: r.nombre_peaux || '',
            ecart_global: r.ecart || '0',
            poids_kg: r.poids_kg || '0',
            prix_unitaire_kg: r.prix_unitaire_kg || '6.00',
            nb_a: r.nb_a || '', nb_b: r.nb_b || '', nb_c: r.nb_c || '', nb_tr: r.nb_tr || '',
            poids_a: r.poids_a || '', poids_b: r.poids_b || '', poids_c: r.poids_c || '', poids_tr: r.poids_tr || '',
            prix_a: r.prix_a || '6.00', prix_b: r.prix_b || '6.00', prix_c: r.prix_c || '6.00', prix_tr: r.prix_tr || '3.00'
        });
        setShowModal(true);
    };

    const deleteReception = async (id) => {
        if (!window.confirm("Supprimer cette réception ?")) return;
        try {
            await api.deleteReception(id);
            setMessage({ type: 'success', text: 'Réception supprimée.' });
            fetchReceptions();
        } catch { setMessage({ type: 'danger', text: 'Erreur suppression.' }); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const f = fournisseurs.find(x => x.id === parseInt(formData.fournisseur_id));
            const fullNum = formData.numero_entree_prefix ? `${formData.numero_entree_prefix}/${f?.code || ''}` : null;
            const payload = {
                fournisseur_id: parseInt(formData.fournisseur_id),
                reference_suivi: selectedReception ? selectedReception.reference_suivi : genRef(),
                numero_entree: fullNum,
                type_peau: 'Mixed',
                nombre_peaux: parseInt(formData.nombre_peaux_global) || 0,
                ecart: formData.ecart_global,
                poids_kg: parseFloat(formData.poids_kg) || 0,
                prix_unitaire_kg: parseFloat(formData.prix_unitaire_kg) || 6.00,
                date_reception: formData.date_reception,
                statut_paiement: formData.statut_paiement,
                nb_a: parseInt(formData.nb_a) || 0,
                nb_b: parseInt(formData.nb_b) || 0,
                nb_c: parseInt(formData.nb_c) || 0,
                nb_tr: parseInt(formData.nb_tr) || 0,
                poids_a: parseFloat(formData.poids_a) || 0,
                poids_b: parseFloat(formData.poids_b) || 0,
                poids_c: parseFloat(formData.poids_c) || 0,
                poids_tr: parseFloat(formData.poids_tr) || 0,
                prix_a: parseFloat(formData.prix_a) || 0,
                prix_b: parseFloat(formData.prix_b) || 0,
                prix_c: parseFloat(formData.prix_c) || 0,
                prix_tr: parseFloat(formData.prix_tr) || 0
            };
            if (selectedReception) {
                await api.updateReception(selectedReception.id, payload);
                setMessage({ type: 'success', text: 'Réception mise à jour.' });
            } else {
                await api.addReception(payload);
                setMessage({ type: 'success', text: 'Réception ajoutée.' });
            }
            setShowModal(false);
            fetchReceptions();
        } catch { setMessage({ type: 'danger', text: 'Erreur lors de l’enregistrement.' }); }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' }}>Chargement des données...</div>;

    return (
        <div className="container">
            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
                    {message.text}
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="card-title mb-0" style={{ color: '#1a659e', fontWeight: 'bold' }}>Réceptions de Peaux</h1>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-success" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📊 Excel
                    </button>
                    <button className="btn btn-primary" onClick={openNewModal} style={{ fontWeight: 'bold' }}>
                        + Nouvelle Réception
                    </button>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>N° Entrée</th>
                                <th>Fournisseur</th>
                                <th>Type</th>
                                <th>Nb Peaux</th>
                                <th>Écart</th>
                                <th>Poids (kg)</th>
                                <th>Prix/kg</th>
                                <th>Total (DH)</th>
                                <th>Date</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receptions.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>Aucune réception trouvée.</td>
                                </tr>
                            ) : (
                                receptions.map(r => (
                                    <tr key={r.id} style={{ verticalAlign: 'middle' }}>
                                        <td><strong>{r.numero_entree || r.reference_suivi}</strong></td>
                                        <td>{r.fournisseur_nom}</td>
                                        <td><span className="badge badge-info">{r.type_peau}</span></td>
                                        <td>
                                            <strong>{r.nombre_peaux != null ? r.nombre_peaux : '—'}</strong>
                                            {(r.nb_a || r.nb_b || r.nb_c || r.nb_tr) ? (
                                                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                                                    {r.nb_a > 0 && <span>A:{r.nb_a} </span>}
                                                    {r.nb_b > 0 && <span>B:{r.nb_b} </span>}
                                                    {r.nb_c > 0 && <span>C:{r.nb_c} </span>}
                                                    {r.nb_tr > 0 && <span>TR:{r.nb_tr} </span>}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td style={{ color: r.ecart ? '#e67e22' : 'inherit' }}>{r.ecart || '—'}</td>
                                        <td>{parseFloat(r.poids_kg || 0).toFixed(2)} kg</td>
                                        <td>{parseFloat(r.prix_unitaire_kg || 0).toFixed(2)} DH</td>
                                        <td><strong>{(parseFloat(r.poids_kg || 0) * parseFloat(r.prix_unitaire_kg || 0)).toFixed(2)} DH</strong></td>
                                        <td>{fmt(r.date_reception)}</td>
                                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                            <button className="btn btn-sm btn-info" style={{ marginRight: '5px' }} onClick={() => printFicheReception(r)} title="Imprimer fiche">🖶</button>
                                            <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }} onClick={() => openEditModal(r)}>Mod</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => deleteReception(r.id)}>Sup</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-light" style={{ fontWeight: 'bold' }}>
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'right' }}>TOTAL GÉNÉRAL</td>
                                <td>{receptions.reduce((s, r) => s + (parseInt(r.nombre_peaux) || 0), 0)}</td>
                                <td></td>
                                <td>{receptions.reduce((s, r) => s + parseFloat(r.poids_kg || 0), 0).toFixed(2)} kg</td>
                                <td></td>
                                <td>{receptions.reduce((s, r) => s + parseFloat(r.poids_kg || 0) * parseFloat(r.prix_unitaire_kg || 0), 0).toFixed(2)} DH</td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={st.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div style={st.modal}>
                        <div style={st.mHeader}>
                            <h2 style={{ margin: 0, fontSize: '18px', color: '#1a659e', fontWeight: 'bold' }}>
                                {selectedReception ? '✏️ Modifier Réception' : '➕ Nouvelle Réception'}
                            </h2>
                            <button style={st.closeBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '25px' }}>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={st.label}>Fournisseur</label>
                                    <select name="fournisseur_id" className="form-control" value={formData.fournisseur_id} onChange={handleInputChange} required>
                                        <option value="">— Sélectionner —</option>
                                        {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom} {f.code ? `(${f.code})` : ''}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={st.label}>Date Réception</label>
                                    <input type="date" name="date_reception" className="form-control" value={formData.date_reception} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={st.label}>N° Entrée</label>
                                    <div style={{ display: 'flex' }}>
                                        <input type="text" name="numero_entree_prefix" className="form-control" placeholder="ex: 816" value={formData.numero_entree_prefix} onChange={handleInputChange} style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }} />
                                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#e9ecef', border: '1px solid #ced4da', borderLeft: 'none', borderTopRightRadius: '4px', borderBottomRightRadius: '4px', fontSize: '14px', color: '#666' }}>
                                            {fournisseurs.find(f => f.id === parseInt(formData.fournisseur_id))?.code ? `/${fournisseurs.find(f => f.id === parseInt(formData.fournisseur_id)).code}` : '/...'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={st.label}>Nb Peaux Global</label>
                                    <input type="number" name="nombre_peaux_global" className="form-control" value={formData.nombre_peaux_global} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
                                <div style={{ display: 'flex', marginBottom: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <div style={{ width: '10%' }}>Qualité</div>
                                    <div style={{ width: '20%' }}>Quantité</div>
                                    <div style={{ width: '25%' }}>Poids (kg)</div>
                                    <div style={{ width: '25%' }}>Prix /kg</div>
                                    <div style={{ width: '20%' }}>Valeur</div>
                                </div>
                                {['a', 'b', 'c', 'tr'].map(q => (
                                    <div key={q} style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                                        <div style={{ width: '10%', textAlign: 'center', fontWeight: 'bold', color: '#1a659e', fontSize: '18px' }}>{q.toUpperCase()}</div>
                                        <div style={{ width: '20%' }}>
                                            <input type="number" name={`nb_${q}`} className="form-control form-control-sm" value={formData[`nb_${q}`]} onChange={handleInputChange} style={{ textAlign: 'center' }} />
                                        </div>
                                        <div style={{ width: '25%' }}>
                                            <input type="number" step="0.01" name={`poids_${q}`} className="form-control form-control-sm" value={formData[`poids_${q}`]} onChange={handleInputChange} style={{ textAlign: 'center' }} />
                                        </div>
                                        <div style={{ width: '25%' }}>
                                            <input type="number" step="0.01" name={`prix_${q}`} className="form-control form-control-sm" value={formData[`prix_${q}`]} onChange={handleInputChange} style={{ textAlign: 'center' }} />
                                        </div>
                                        <div style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                                            {(parseFloat(formData[`poids_${q}`] || 0) * parseFloat(formData[`prix_${q}`] || 0)).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '8px', background: '#e8f4fd', border: '1px solid #bee3f8' }}>
                                <div style={{ fontSize: '14px', color: '#1a659e' }}>
                                    Écart: <strong>{formData.ecart_global}</strong> | Σ Poids: <strong>{parseFloat(formData.poids_kg || 0).toFixed(2)} kg</strong>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', color: '#1a659e', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '2px' }}>Valeur Totale</div>
                                    <div style={{ fontSize: '20px', color: '#1a659e', fontWeight: '900' }}>
                                        {((parseFloat(formData.poids_a || 0) * parseFloat(formData.prix_a || 0)) +
                                            (parseFloat(formData.poids_b || 0) * parseFloat(formData.prix_b || 0)) +
                                            (parseFloat(formData.poids_c || 0) * parseFloat(formData.prix_c || 0)) +
                                            (parseFloat(formData.poids_tr || 0) * parseFloat(formData.prix_tr || 0))).toFixed(2)} DH
                                    </div>
                                </div>
                            </div>

                            <div style={st.mFooter}>
                                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary px-4" style={{ minWidth: '150px' }}>
                                    {selectedReception ? '🔄 Mettre à jour' : '💾 Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const st = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modal: { background: 'white', borderRadius: '16px', width: '95%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
    mHeader: { padding: '20px 25px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa' },
    mFooter: { padding: '20px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: '15px' },
    label: { display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', color: '#495057' },
    closeBtn: { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#adb5bd', lineHeight: 1 }
};

export default Receptions;
