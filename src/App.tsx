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

  useEffect(() => {
    // @ts-ignore
    onValue(ref(db, 'locations'), (snapshot) => {
      const data = snapshot.val();
      setLocations(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
    });
  }, []);

  const deleteItem = (id: string) => {
    // @ts-ignore
    remove(ref(db, `locations/${id}`));
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#1a202c' }}>🚢 ΧΙΟΣ 2026</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '400px', margin: 'auto' }}>
        {PAYERS.map(p => (
          <button key={p} onClick={() => setUser(p)} style={{ padding: '15px', borderRadius: '12px', border: 'none', background: 'white', fontSize: '16px', color: '#2d3748', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {AVATARS[p]} {p}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>{AVATARS[user]} {user}</h2>
        <button onClick={() => setUser(null)} style={{ border: 'none', background: '#feb2b2', borderRadius: '8px', padding: '5px 10px' }}>Έξοδος</button>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        {['map', 'expenses', 'calendar'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === tab ? '#3182ce' : '#cbd5e0', color: 'white' }}>
            {tab === 'map' ? '📍 Χάρτης' : tab === 'expenses' ? '💰 Έξοδα' : '📅 Πλάνο'}
          </button>
        ))}
      </div>

      {activeTab === 'map' && (
        <div>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196425.4616223253!2d25.8604!3d38.3724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a36f98a28e3575%3A0x400bd2ce2b98290!2zQ2hpb3MsIEdyZWVjZQ!5e0!3m2!1sen!2sgr!4v1620000000000" 
            width="100%" height="300" style={{ border: 0, borderRadius: '15px' }} allowFullScreen></iframe>
          {locations.map(loc => (
            <div key={loc.id} style={{ background: 'white', padding: '10px', marginTop: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{loc.type} - {loc.addedBy}</span>
              <button onClick={() => deleteItem(loc.id)} style={{ background: '#f56565', color: 'white', border: 'none', borderRadius: '4px' }}>X</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div>
          <h3>Σύνολο Εξόδων</h3>
          {locations.map(loc => (
            <div key={loc.id} style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
              {loc.addedBy}: {loc.cost || 0}€ ({loc.type})
            </div>
          ))}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div>
          <h3>Πρόγραμμα - Ημερολόγιο</h3>
          {locations.map(loc => (
            <div key={loc.id} style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
              <strong>{loc.date}</strong>: {loc.comment}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}