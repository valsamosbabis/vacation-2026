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
  const [cost, setCost] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    // @ts-ignore
    onValue(ref(db, 'locations'), (snapshot) => {
      const data = snapshot.val();
      setLocations(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
    });
  }, []);

  const saveItem = () => {
    if (!cost || !comment) return;
    // @ts-ignore
    push(ref(db, 'locations'), { addedBy: user, cost, comment, date: new Date().toLocaleDateString('el-GR') });
    setCost(''); setComment(''); setShowModal(false);
  };

  const deleteItem = (id: string) => { /* @ts-ignore */ remove(ref(db, `locations/${id}`)); };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#2d3748', marginBottom: '40px' }}>🚢 ΧΙΟΣ 2026</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', width: '100%', maxWidth: '350px' }}>
        {PAYERS.map(p => (
          <button key={p} onClick={() => setUser(p)} style={{ padding: '20px', borderRadius: '16px', border: 'none', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontWeight: '600', cursor: 'pointer' }}>
            {AVATARS[p]} {p}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{AVATARS[user]} {user}</h2>
        <button onClick={() => setUser(null)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#feb2b2' }}>Έξοδος</button>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        {[{id: 'map', label: '📍 Χάρτης'}, {id: 'expenses', label: '💰 Έξοδα'}, {id: 'calendar', label: '📅 Πλάνο'}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === tab.id ? '#3182ce' : '#cbd5e0', color: 'white' }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'map' && (
        <div>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196426.6579624534!2d25.8641972!3d38.3756288!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a014e7a8e7e1f9%3A0x400bd2ceb9a0160!2sChios!5e0!3m2!1sen!2sgr!4v1620000000000" width="100%" height="300" style={{ border: 0, borderRadius: '15px' }}></iframe>
          <button onClick={() => setShowModal(true)} style={{ width: '100%', marginTop: '15px', padding: '15px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px' }}>+</button>
        </div>
      )}

      {activeTab === 'expenses' && locations.map(loc => (
        <div key={loc.id} style={{ background: '#fff', padding: '15px', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{loc.addedBy}: <strong>{loc.cost}€</strong></span>
          <button onClick={() => deleteItem(loc.id)} style={{ background: '#f56565', color: 'white', border: 'none', borderRadius: '4px' }}>X</button>
        </div>
      ))}

      {activeTab === 'calendar' && locations.map(loc => (
        <div key={loc.id} style={{ background: '#fff', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
          <strong>{loc.date}</strong> - {loc.comment}
        </div>
      ))}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', width: '100%' }}>
            <h3>Προσθήκη</h3>
            <input type="number" placeholder="Κόστος (€)" onChange={e => setCost(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <input placeholder="Σχόλιο" onChange={e => setComment(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <button onClick={saveItem} style={{ width: '100%', padding: '15px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px' }}>Αποθήκευση</button>
            <button onClick={() => setShowModal(false)} style={{ width: '100%', marginTop: '10px', padding: '10px' }}>Άκυρο</button>
          </div>
        </div>
      )}
    </div>
  );
}