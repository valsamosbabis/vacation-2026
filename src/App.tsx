import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, push, remove, set } from 'firebase/database';

// Ρυθμίσεις Παρέας
const PAYERS = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ', 'ΦΩΦΗ', 'ΜΑΡΙΛΗ', 'ΛΙΤΣΑ', 'ΒΑΣΙΛΙΚΗ'];
const CAN_ADD = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ'];
const AVATARS: { [key: string]: string } = {
  'ΓΙΩΡΓΟΣ': '👨‍💼', 'ΜΠΑΜΠΗΣ': '👨‍🔧', 'ΚΩΣΤΑΣ': '👨‍💻', 'ΔΗΜΗΤΡΗΣ': '👨‍🎨',
  'ΦΩΦΗ': '👩‍⚖️', 'ΜΑΡΙΛΗ': '👩‍🔬', 'ΛΙΤΣΑ': '👩‍🍳', 'ΒΑΣΙΛΙΚΗ': '👩‍⚕️'
};

// Styling
const commonStyle = {
  button: { 
    padding: '12px', 
    borderRadius: '12px', 
    border: 'none', 
    cursor: 'pointer', 
    fontWeight: '600', 
    transition: '0.3s', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    backgroundColor: '#333333', // Εδώ ορίζεις το χρώμα του κουμπιού
    color: '#000000'            // Εδώ το χρώμα του κειμένου στο κουμπί
  },
  input: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '10px', 
    border: '1px solid #e2e8f0', 
    marginBottom: '10px', 
    boxSizing: 'border-box' as 'border-box', 
    fontSize: '14px',
    backgroundColor: '#ffffff', // Φόντο input
    color: '#000000'            // Χρώμα κειμένου μέσα στο input
  }
};

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [tab, setTab] = useState('map');
  const [showModal, setShowModal] = useState(false);
  
  // States για Έξοδα
  const [expenses, setExpenses] = useState<any[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  
  // States για Χάρτη (Modal)
  const [placeType, setPlaceType] = useState('🏖️ Παραλία');
  const [placeLink, setPlaceLink] = useState('');
  const [placeComment, setPlaceComment] = useState('');

  // States για Πρόγραμμα
  const [schedule, setSchedule] = useState<any>({});
  const days = Array.from({ length: 12 }, (_, i) => `${(i + 10).toString().padStart(2, '0')}/08/2026`);

  useEffect(() => {
    // Φόρτωση Εξόδων
    onValue(ref(db, 'expenses'), (snapshot) => {
      const data = snapshot.val();
      setExpenses(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
    });
    // Φόρτωση Προγράμματος
    onValue(ref(db, 'schedule'), (snapshot) => {
      setSchedule(snapshot.val() || {});
    });
  }, []);

  // Λογική Εκκαθάρισης
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const fairShare = totalSpent / 15;
  const getBalance = (p: string) => {
    const paid = expenses.filter(e => e.payer === p).reduce((sum, e) => sum + e.amount, 0);
    const multiplier = p === 'ΓΙΩΡΓΟΣ' ? 3 : 4;
    return paid - (fairShare * multiplier);
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#1e293b' }}>🚢 ΧΙΟΣ 2026</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Ποιος είσαι;</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '400px', margin: 'auto' }}>
        {PAYERS.map(p => <button key={p} onClick={() => setUser(p)} style={{...commonStyle.button, background: '#fff', fontSize: '16px'}}>{AVATARS[p]} {p}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px', fontFamily: 'system-ui', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>{AVATARS[user]} {user}</h2>
        <button onClick={() => setUser(null)} style={{...commonStyle.button, background: '#fee2e2', color: '#ef4444', padding: '8px 15px', boxShadow: 'none'}}>Έξοδος</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        {['map', 'expenses', 'schedule'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{...commonStyle.button, flex: 1, background: tab === t ? '#3b82f6' : '#e2e8f0', color: tab === t ? 'white' : '#475569'}}>
            {t === 'map' ? '📍 ΧΑΡΤΗΣ' : t === 'expenses' ? '💶 ΕΞΟΔΑ' : '📅 ΠΛΑΝΟ'}
          </button>
        ))}
      </div>

      {/* TAB: ΧΑΡΤΗΣ */}
      {tab === 'map' && (
        <div style={{ position: 'relative', height: '500px', borderRadius: '20px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196417.89201637503!2d25.86435439403889!3d38.37562625895782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a3bd51921f649b%3A0x633d395d9715a31a!2zzqfOv86-zq_Ov8-F!5e0!3m2!1sel!2sgr!4v1716999999999" 
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy">
          </iframe>
          
          <button onClick={() => setShowModal(true)} style={{...commonStyle.button, position: 'absolute', bottom: '20px', right: '20px', background: '#3b82f6', color: 'white', borderRadius: '50%', width: '65px', height: '65px', fontSize: '35px' }}>+</button>

          {showModal && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', padding: '20px', zIndex: 10, display: 'flex', alignItems: 'center' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '15px', width: '100%' }}>
                <h3 style={{ marginTop: 0 }}>Νέα Τοποθεσία</h3>
                <select value={placeType} onChange={e => setPlaceType(e.target.value)} style={commonStyle.input}>
                  <option>🏖️ Παραλία</option>
                  <option>🍴 Εστιατόριο</option>
                  <option>📌 Άλλο</option>
                </select>
                <input placeholder="Google Maps Link" value={placeLink} onChange={e => setPlaceLink(e.target.value)} style={commonStyle.input} />
                <textarea placeholder="Σχόλια" value={placeComment} onChange={e => setPlaceComment(e.target.value)} style={{...commonStyle.input, height: '80px'}} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowModal(false)} style={{...commonStyle.button, flex: 1, background: '#f1f5f9'}}>Άκυρο</button>
                  <button onClick={() => setShowModal(false)} style={{...commonStyle.button, flex: 1, background: '#3b82f6', color: 'white'}}>Αποθήκευση</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ΕΞΟΔΑ */}
      {tab === 'expenses' && (
        <div>
          {/* Ποιος χρωστάει σε ποιον */}
          <div style={{ background: '#1e293b', color: 'white', padding: '15px', borderRadius: '16px', marginBottom: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📊 ΕΚΚΑΘΑΡΙΣΗ (Shares 15)</h3>
            {CAN_ADD.map(p => {
              const b = getBalance(p);
              if (b >= 0) return null;
              const creditor = CAN_ADD.find(c => getBalance(c) > 0) || "Παρέα";
              return (
                <div key={p} style={{ marginBottom: '5px', fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '5px' }}>
                  {AVATARS[p]} <b>{p}</b> χρωστάει <span style={{ color: '#f87171' }}>{Math.abs(b).toFixed(2)}€</span> στον {creditor}
                </div>
              );
            })}
            {expenses.length === 0 && <p style={{ fontSize: '12px', opacity: 0.6 }}>Δεν υπάρχουν έξοδα ακόμα.</p>}
          </div>

          {/* Φόρμα */}
          {CAN_ADD.includes(user) && (
            <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
              <input placeholder="Τι πληρώσαμε;" value={desc} onChange={e => setDesc(e.target.value)} style={commonStyle.input} />
              <input type="number" placeholder="Ποσό (€)" value={amount} onChange={e => setAmount(e.target.value)} style={commonStyle.input} />
              <button onClick={() => {
                if(!desc || !amount) return;
                push(ref(db, 'expenses'), { desc, amount: parseFloat(amount), payer: user, date: new Date().toLocaleDateString('el-GR') });
                setDesc(''); setAmount('');
              }} style={{...commonStyle.button, width: '100%', background: '#3b82f6', color: 'white'}}>Καταχώρηση</button>
            </div>
          )}

          {/* Λίστα */}
          {expenses.slice().reverse().map(e => (
            <div key={e.id} style={{ background: 'white', padding: '12px', borderRadius: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '14px' }}><b>{AVATARS[e.payer]} {e.payer}</b>: {e.desc}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{e.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{e.amount.toFixed(2)}€</span>
                {e.payer === user && (
                  <button onClick={() => remove(ref(db, `expenses/${e.id}`))} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }}>✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: ΠΡΟΓΡΑΜΜΑ */}
      {tab === 'schedule' && (
        <div>
          {days.map(day => (
            <div key={day} style={{ background: 'white', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '16px' }}>📅 {day}</h3>
              {['Πρωί', 'Μεσημέρι', 'Βράδυ'].map(slot => (
                <div key={slot} style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block' }}>{slot.toUpperCase()}</label>
                  <input 
                    value={schedule[day]?.[slot] || ''} 
                    onChange={(e) => set(ref(db, `schedule/${day.replace(/\//g, '-')}/${slot}`), e.target.value)}
                    placeholder="..." 
                    style={{...commonStyle.input, padding: '6px', marginBottom: 0, border: 'none', borderBottom: '1px solid #f1f5f9', borderRadius: 0}} 
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
