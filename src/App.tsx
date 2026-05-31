import React, { useState, useEffect } from 'react';
import { db } from './firebase';
// @ts-ignore
import { ref, onValue } from 'firebase/database';

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
    const locRef = ref(db, 'locations');
    // @ts-ignore
    onValue(locRef, (snapshot) => {
      const data = snapshot.val();
      setLocations(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
    });
  }, []);

  if (!user) return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px', fontFamily: '-apple-system, sans-serif'
    }}>
      <h1 style={{ color: '#2d3748', marginBottom: '40px', fontSize: '2rem' }}>🚢 Χίος 2026</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', width: '100%', maxWidth: '350px' }}>
        {PAYERS.map(p => (
          <button key={p} onClick={() => setUser(p)} style={{ 
            padding: '20px 10px', borderRadius: '16px', border: 'none', background: '#fff', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontWeight: '600', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
          }}>
            <span>{AVATARS[p]}</span>{p}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{AVATARS[user]} {user}</h2>
        <button onClick={() => setUser(null)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#e2e8f0' }}>Έξοδος</button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', background: '#f1f5f9', padding: '5px', borderRadius: '12px' }}>
        {['map', 'expenses', 'calendar'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ 
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: activeTab === tab ? '#3b82f6' : 'transparent', color: activeTab === tab ? 'white' : '#64748b'
          }}>
            {tab === 'map' ? '📍 Χάρτης' : tab === 'expenses' ? '💰 Έξοδα' : '📅 Ημερολόγιο'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '300px' }}>
        {activeTab === 'map' && <div><h3>Χάρτης</h3><p>Εδώ θα εμφανίζεται ο χάρτης με τα pins.</p></div>}
        {activeTab === 'expenses' && <div><h3>Έξοδα</h3><p>Εδώ θα διαχειριζόμαστε τα έξοδα.</p></div>}
        {activeTab === 'calendar' && <div><h3>Ημερολόγιο</h3><p>Εδώ θα είναι το πρόγραμμα.</p></div>}
      </div>
    </div>
  );
}