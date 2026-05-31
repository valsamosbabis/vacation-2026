import React, { useState, useEffect } from 'react';
import { db } from './firebase';
// @ts-ignore
import { ref, push, onValue } from 'firebase/database';

const PAYERS = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ', 'ΦΩΦΗ', 'ΜΑΡΙΛΗ', 'ΛΙΤΣΑ', 'ΒΑΣΙΛΙΚΗ'];

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

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <h1>🚢 ΧΙΟΣ 2026</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {PAYERS.map(p => <button key={p} onClick={() => setUser(p)} style={{ padding: '20px' }}>{p}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px', fontFamily: 'system-ui' }}>
      <button onClick={() => setUser(null)}>Έξοδος</button>
      <h2>{user}</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('map')}>📍 Χάρτης</button>
        <button onClick={() => setActiveTab('expenses')}>💰 Έξοδα</button>
        <button onClick={() => setActiveTab('calendar')}>📅 Ημερολόγιο</button>
      </div>

      {activeTab === 'map' && (
        <div>
          <div style={{ height: '300px', background: '#ccc' }}>
            <iframe src="https://www.google.com/maps/d/embed?mid=1Q... (βάλε εδώ το δικό σου link)" width="100%" height="100%"></iframe>
          </div>
          {locations.map(loc => <div key={loc.id}>{loc.type} - {loc.comment}</div>)}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div>
          <h3>Έξοδα</h3>
          {locations.map(loc => <div key={loc.id}>{loc.addedBy}: {loc.cost}€</div>)}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div>
          <h3>Ημερολόγιο</h3>
          {locations.map(loc => <div key={loc.id}>{loc.date}: {loc.type}</div>)}
        </div>
      )}
    </div>
  );
}