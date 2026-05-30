import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, push, remove, set } from 'firebase/database';

const PAYERS = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ', 'ΦΩΦΗ', 'ΜΑΡΙΛΗ', 'ΛΙΤΣΑ', 'ΒΑΣΙΛΙΚΗ'];
const CAN_ADD = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ'];
const AVATARS: { [key: string]: string } = {
  'ΓΙΩΡΓΟΣ': '👨‍💼', 'ΜΠΑΜΠΗΣ': '👨‍🔧', 'ΚΩΣΤΑΣ': '👨‍💻', 'ΔΗΜΗΤΡΗΣ': '👨‍🎨',
  'ΦΩΦΗ': '👩‍⚖️', 'ΜΑΡΙΛΗ': '👩‍🔬', 'ΛΙΤΣΑ': '👩‍🍳', 'ΒΑΣΙΛΙΚΗ': '👩‍⚕️'
};

const commonStyle = {
  button: { padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: '#333333', color: '#ffffff' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px', boxSizing: 'border-box' as 'border-box', fontSize: '14px' }
};

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [tab, setTab] = useState('map');
  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [placeType, setPlaceType] = useState('🏖️ Παραλία');
  const [placeLink, setPlaceLink] = useState('');
  const [placeComment, setPlaceComment] = useState('');

  useEffect(() => {
    onValue(ref(db, 'expenses'), (snapshot) => {
      const data = snapshot.val();
      setExpenses(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
    });
  }, []);

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h1>🚢 ΧΙΟΣ 2026</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '400px', margin: 'auto' }}>
        {PAYERS.map(p => <button key={p} onClick={() => setUser(p)} style={commonStyle.button}>{AVATARS[p]} {p}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>{AVATARS[user]} {user}</h2>
        <button onClick={() => setUser(null)} style={{...commonStyle.button, background: '#fee2e2', color: '#ef4444'}}>Έξοδος</button>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        <button onClick={() => setTab('map')} style={{...commonStyle.button, flex:1}}>📍 ΧΑΡΤΗΣ</button>
        <button onClick={() => setTab('expenses')} style={{...commonStyle.button, flex:1}}>💶 ΕΞΟΔΑ</button>
      </div>

      {tab === 'map' && (
        <div style={{ position: 'relative', height: '500px', borderRadius: '20px', overflow: 'hidden' }}>
          {/* ΧΑΡΤΗΣ ΧΙΟΥ: Αντέγραψε το σωστό embed link από το Google Maps */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d200388.9482903823!2d25.86432655!3d38.36647465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a01c875d710f63%3A0x400bd2ce2b98450!2zzqfOv86-zq_Ov8-F!5e0!3m2!1sel!2sgr!4v1680000000000" 
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy">
          </iframe>

          <button onClick={() => setShowModal(true)} style={{...commonStyle.button, position: 'absolute', bottom: '20px', right: '20px', borderRadius: '50%', width: '60px', height: '60px' }}>+</button>

          {showModal && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', padding: '20px', display: 'flex', alignItems: 'center' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '15px', width: '100%' }}>
                <h3>Νέα Τοποθεσία</h3>
                <input placeholder="Google Maps Link" value={placeLink} onChange={e => setPlaceLink(e.target.value)} style={commonStyle.input} />
                <textarea placeholder="Σχόλια" value={placeComment} onChange={e => setPlaceComment(e.target.value)} style={commonStyle.input} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowModal(false)} style={{...commonStyle.button, flex:1, background:'#ddd'}}>Άκυρο</button>
                  <button onClick={() => {
                    push(ref(db, 'locations'), { type: placeType, link: placeLink, comment: placeComment, addedBy: user });
                    setShowModal(false);
                  }} style={{...commonStyle.button, flex:1, background:'#3b82f6'}}>Αποθήκευση</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}