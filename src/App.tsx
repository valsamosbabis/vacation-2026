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
    if (!comment) return;
    // @ts-ignore
    push(ref(db, 'locations'), { addedBy: user, type, link, comment, date: new Date().toLocaleDateString('el-GR') });
    setLink(''); setComment(''); setShowModal(false);
  };

  const deleteItem = (id: string) => { /* @ts-ignore */ remove(ref(db, `locations/${id}`)); };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '20px', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#2d3748', marginBottom: '30px' }}>🚢 ΧΙΟΣ 2026</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '320px' }}>
        {PAYERS.map(p => (
          <button key={p} onClick={() => setUser(p)} style={{ padding: '15px', borderRadius: '12px', border: 'none', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontWeight: '600', cursor: 'pointer' }}>
            {AVATARS[p]} {p}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '480px', margin: 'auto', padding: '15px', paddingBottom: '80px', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{AVATARS[user]} {user}</h2>
        <button onClick={() => setUser(null)} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: '#feb2b2', fontSize: '0.8rem' }}>Έξοδος</button>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
        {[{id: 'map', label: '📍 Χάρτης'}, {id: 'expenses', label: '💰 Έξοδα'}, {id: 'calendar', label: '📅 Πλάνο'}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === tab.id ? '#3182ce' : '#e2e8f0', color: activeTab === tab.id ? 'white' : '#4a5568', fontWeight: '600' }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'map' && (
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196417.8093125692!2d25.8756!3d38.3756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a01c4!2sChios!5e0!3m2!1sen!2sgr!4v1!5m2!1sen!2sgr" 
          width="100%" height="350" style={{ border: 'none', borderRadius: '15px' }}></iframe>
      )}

      {locations.map(loc => (
        <div key={loc.id} style={{ background: '#fff', padding: '12px', marginTop: '10px', borderRadius: '10px', borderLeft: '4px solid #3182ce' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
            <strong>{loc.type}</strong>
            <button onClick={() => deleteItem(loc.id)} style={{ background: '#f56565', color: 'white', border: 'none', borderRadius: '4px', padding: '0 8px' }}>X</button>
          </div>
          <p style={{ margin: '0', fontSize: '0.9rem' }}>{loc.comment}</p>
          {loc.link && <a href={loc.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#3182ce' }}>Δες χάρτη</a>}
        </div>
      ))}

      {/* Fixed Add Button για ευκολία στο κινητό */}
      <button onClick={() => setShowModal(true)} style={{ position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px', borderRadius: '50%', background: '#3182ce', color: 'white', border: 'none', fontSize: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 100 }}>+</button>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 200 }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', width: '100%' }}>
            <h3>Νέα εγγραφή</h3>
            <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px' }}>
              <option>🏖️ Παραλία</option><option>🍴 Εστιατόριο</option><option>📌 Άλλο</option>
            </select>
            <input placeholder="Google Maps Link" onChange={e => setLink(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px' }} />
            <textarea placeholder="Σχόλια" onChange={e => setComment(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px' }} />
            <button onClick={saveItem} style={{ width: '100%', padding: '15px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px' }}>Αποθήκευση</button>
            <button onClick={() => setShowModal(false)} style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', border: 'none' }}>Άκυρο</button>
          </div>
        </div>
      )}
    </div>
  );
}