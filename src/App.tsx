import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const ALLOWED_TO_ADD = ["ΓΙΩΡΓΟΣ", "ΔΗΜΗΤΡΗΣ", "ΜΠΑΜΠΗΣ", "ΚΩΣΤΑΣ"];
const CATS = ["Supermarket", "Καύσιμα", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [tab, setTab] = useState('MAP');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ desc: '', cat: 'Supermarket', amount: '' });

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'expenses'), (s) => {
        const d = s.val();
        setExpenses(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
      });
    }
  }, [user]);

  const calculateShare = (amount: number) => {
    const total = parseFloat(amount.toString());
    return { 
      gShare: ((total / 15) * 3).toFixed(2), 
      othersShare: ((total / 15) * 4).toFixed(2) 
    };
  };

  if (!user) {
    return (
      <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:'20px', fontFamily:'sans-serif'}}>
        <h1 style={{color:'#1e3a8a', marginBottom:'30px'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} style={{padding:'20px', borderRadius:'15px', border:'2px solid #1e3a8a', background:'white', color:'#1e3a8a', fontWeight:'bold', cursor:'pointer'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', fontFamily:'sans-serif'}}>
      {/* HEADER */}
      <div style={{background:'#1e3a8a', color:'white', padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span>User: <strong>{user}</strong></span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{background:'#ef4444', color:'white', border:'none', padding:'8px 12px', borderRadius:'8px', cursor:'pointer'}}>Έξοδος</button>
      </div>

      {/* TABS */}
      <div style={{display:'flex', background:'white', borderBottom:'1px solid #e2e8f0'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:'15px', border:'none', background: tab===t ? '#e0f2fe' : 'transparent', color: tab===t ? '#1e3a8a' : '#64748b', fontWeight:'bold', cursor:'pointer'}}>{t}</button>
        ))}
      </div>

      <div style={{padding:'20px'}}>
        {tab === 'MAP' && <div style={{height:'300px', background:'#e2e8f0', borderRadius:'15px', display:'flex', alignItems:'center', justifyContent:'center', border:'2px dashed #94a3b8', color:'#64748b'}}>ΧΑΡΤΗΣ ΧΙΟΥ</div>}

        {tab === 'EXPENSES' && (
          <div>
            {ALLOWED_TO_ADD.includes(user) && <button onClick={() => setModal(true)} style={{width:'100%', padding:'15px', background:'#1e3a8a', color:'white', borderRadius:'10px', border:'none', marginBottom:'20px', cursor:'pointer', fontWeight:'bold'}}>+ Προσθήκη Εξόδου</button>}
            {expenses.sort((a,b) => b.ts - a.ts).map(e => {
              const { gShare, othersShare } = calculateShare(e.amount);
              return (
                <div key={e.id} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', border:'1px solid #e2e8f0'}}>
                  <div style={{fontWeight:'bold'}}>{e.desc} - {e.amount}€ ({e.cat})</div>
                  <div style={{fontSize:'12px', color:'#64748b', marginBottom:'10px'}}>Ημερ: {new Date(e.ts).toLocaleDateString()} | Από: {e.user}</div>
                  <div style={{background:'#f1f5f9', padding:'8px', borderRadius:'5px', fontSize:'13px'}}>Γιώργος (3/15): <b>{gShare}€</b> | Υπόλοιποι (4/15 ανά άτομο): <b>{othersShare}€</b></div>
                  {ALLOWED_TO_ADD.includes(user) && <button onClick={() => remove(ref(db, `expenses/${e.id}`))} style={{marginTop:'10px', background:'none', color:'red', border:'none', cursor:'pointer', fontSize:'12px'}}>Διαγραφή</button>}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'CALENDAR' && <div style={{textAlign:'center', padding:'40px', color:'#64748b'}}><h3>Ημερολόγιο</h3><p>Πρόγραμμα εκδηλώσεων...</p></div>}
      </div>

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
          <form style={{background:'white', padding:'25px', borderRadius:'15px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => { e.preventDefault(); push(ref(db, 'expenses'), { ...form, amount: parseFloat(form.amount), user, ts: Date.now() }); setModal(false); }}>
            <h3>Νέο Έξοδο</h3>
            <select onChange={e => setForm({...form, cat: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
            <input placeholder="Περιγραφή" required onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <input type="number" placeholder="Ποσό (€)" required onChange={e => setForm({...form, amount: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <button type="submit" style={{width:'100%', padding:'12px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Αποθήκευση</button>
            <button type="button" onClick={() => setModal(false)} style={{width:'100%', padding:'10px', marginTop:'10px', background:'none', border:'none', cursor:'pointer'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;