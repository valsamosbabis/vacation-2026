import React, { useState, useEffect } from 'react';
import { db } from './firebase';
// @ts-ignore
import { ref, onValue, remove, push } from 'firebase/database';

const PAYERS = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ', 'ΦΩΦΗ', 'ΜΑΡΙΛΗ', 'ΛΙΤΣΑ', 'ΒΑΣΙΛΙΚΗ'];
const AVATARS: { [key: string]: string } = {
  'ΓΙΩΡΓΟΣ': '👨‍💼', 'ΜΠΑΜΠΗΣ': '👨‍🔧', 'ΚΩΣΤΑΣ': '👨‍💻', 'ΔΗΜΗΤΡΗΣ': '👨‍🎨',
  'ΦΩΦΗ': '👩‍⚖️', 'ΜΑΡΙΛΗ': '👩‍🔬', 'ΛΙΤΣΑ': '👩‍🍳', 'ΒΑΣΙΛΙΚΗ': '👩‍⚕️'
};

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [locations, setLocations] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // States για την φόρμα
  const [type, setType] = useState('🏖️ Παραλία');
  const [link, setLink] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    // @ts-ignore
    onValue(ref(db, 'locations'), (snapshot) => {
      const data = snapshot.val();
      setLocations(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
    });
  }, []);

  const saveItem = () => {
    if (!link || !comment) return;
    // @ts-ignore
    push(ref(db, 'locations'), { addedBy: user, type, link, comment, date: new Date().toLocaleDateString('el-GR') });
    setLink(''); setComment(''); setShowModal(false);
  };

  const deleteItem = (id: string) => { /* @ts-ignore */ remove(ref(db, `locations/${id}`)); };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#2d3748', marginBottom: '40px', fontSize: '2.5rem' }}>🚢 ΧΙΟΣ 2026</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', width: '100%', maxWidth: '350px' }}>
        {PAYERS.map(p => (
          <button key={p} onClick={() => setUser(p)} style={{ padding: '20px', borderRadius: '16px', border: 'none', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', color: '#4a5568' }}>
            {AVATARS[p]} {p}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px', fontFamily: 'sans-serif', color: '#2d3748' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem' }}>{AVATARS[user]} {user}</h2>
        <button onClick={() => setUser(null)} style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: '#feb2b2', fontWeight: 'bold' }}>Έξοδος</button>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        {[{id: 'map', label: '📍 Χάρτης'}, {id: 'expenses', label: '💰 Έξοδα'}, {id: 'calendar', label: '📅 Πλάνο'}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === tab.id ? '#3182ce' : '#cbd5e0', color: 'white', fontWeight: 'bold' }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'map' && (
        <div>
          <iframe src="https://maps.google.com/?cid=1244361639074959537&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ" width="100%" height="300" style={{ border: '2px solid #3182ce', borderRadius: '15px' }}></iframe>
          <button onClick={() => setShowModal(true)} style={{ width: '100%', marginTop: '15px', padding: '15px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold' }}>+ Προσθήκη Σημείου</button>
        </div>
      )}

      {activeTab !== 'map' && locations.map(loc => (
        <div key={loc.id} style={{ background: '#fff', padding: '15px', marginBottom: '10px', borderRadius: '10px', borderLeft: '5px solid #3182ce' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{loc.type}</strong>
            <button onClick={() => deleteItem(loc.id)} style={{ background: '#f56565', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px' }}>X</button>
          </div>
          <p style={{ margin: '5px 0' }}>{loc.comment}</p>
          <a href={loc.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#3182ce' }}>Δες στον χάρτη</a>
        </div>
      ))}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', width: '100%' }}>
            <h3>Προσθήκη Τοποθεσίας</h3>
            <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
              <option>🏖️ Παραλία</option><option>🍴 Εστιατόριο</option><option>📌 Άλλο</option>
            </select>
            <input placeholder="Google Maps Link" onChange={e => setLink(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <textarea placeholder="Σχόλιο" onChange={e => setComment(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <button onClick={saveItem} style={{ width: '100%', padding: '15px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Αποθήκευση</button>
            <button onClick={() => setShowModal(false)} style={{ width: '100%', marginTop: '10px', padding: '10px', border: 'none', background: 'transparent' }}>Άκυρο</button>
          </div>
        </div>
      )}
    </div>
  );
}