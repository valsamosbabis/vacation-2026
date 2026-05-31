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
  const [cost, setCost] = useState('0');

  useEffect(() => {
    // @ts-ignore
    onValue(ref(db, 'locations'), (snapshot) => {
      const data = snapshot.val();
      setLocations(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
    });
  }, []);

  const saveItem = () => {
    // @ts-ignore
    push(ref(db, 'locations'), { addedBy: user, type, link, comment, cost: parseFloat(cost), date: new Date().toLocaleDateString('el-GR') });
    setLink(''); setComment(''); setCost('0'); setShowModal(false);
  };

  const deleteItem = (id: string) => { /* @ts-ignore */ remove(ref(db, `locations/${id}`)); };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px', fontFamily: 'system-ui' }}>
      <h1 style={{ textAlign: 'center', color: '#1e293b' }}>🚢 ΧΙΟΣ 2026</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {PAYERS.map(p => <button key={p} onClick={() => setUser(p)} style={{ padding: '15px', borderRadius: '12px', border: 'none', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>{AVATARS[p]} {p}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '480px', margin: 'auto', paddingBottom: '80px', fontFamily: 'system-ui', color: '#1e293b' }}>
      <div style={{ padding: '15px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
        <strong>{AVATARS[user]} {user}</strong>
        <button onClick={() => setUser(null)} style={{ border: 'none', background: '#fee2e2', borderRadius: '4px', padding: '2px 8px' }}>Έξοδος</button>
      </div>

      <div style={{ display: 'flex', padding: '10px', gap: '5px' }}>
        {[{id: 'map', label: '📍 Χάρτης'}, {id: 'expenses', label: '💰 Έξοδα'}, {id: 'calendar', label: '📅 Πλάνο'}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === tab.id ? '#2563eb' : '#e2e8f0', color: activeTab === tab.id ? '#fff' : '#000', fontWeight: 'bold' }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ padding: '15px' }}>
        {activeTab === 'map' && <iframe src="https://www.google.com/maps/contrib/102076526139493963788/reviews" width="100%" height="300" style={{ border: 'none', borderRadius: '12px' }}></iframe>}
        {activeTab === 'expenses' && locations.map(l => <div key={l.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{l.addedBy}: {l.cost}€ ({l.type})</div>)}
        {activeTab === 'calendar' && Array.from({length: 12}, (_, i) => 10 + i).map(day => (
          <div key={day} style={{ marginBottom: '15px' }}><strong>10-21 Αυγούστου: Ημέρα {day}</strong><div style={{ fontSize: '0.8rem' }}>1. Πρωινό 2. Θάλασσα 3. Φαγητό</div></div>
        ))}
      </div>

      <button onClick={() => setShowModal(true)} style={{ position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px', borderRadius: '50%', background: '#2563eb', color: 'white', border: 'none', fontSize: '24px' }}>+</button>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', width: '100%' }}>
            <h3>Προσθήκη</h3>
            <select onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '10px' }}><option>🏖️ Παραλία</option><option>🍴 Εστιατόριο</option><option>📌 Άλλο</option></select>
            <input type="number" placeholder="Κόστος" onChange={e => setCost(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '10px' }} />
            <input placeholder="Link" onChange={e => setLink(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '10px' }} />
            <textarea placeholder="Σχόλιο" onChange={e => setComment(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '10px' }} />
            <button onClick={saveItem} style={{ width: '100%', padding: '15px', background: '#2563eb', color: 'white', border: 'none', marginTop: '10px' }}>Αποθήκευση</button>
          </div>
        </div>
      )}
    </div>
  );
}