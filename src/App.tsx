import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const ALLOWED_TO_ADD = ["ΓΙΩΡΓΟΣ", "ΔΗΜΗΤΡΗΣ", "ΜΠΑΜΠΗΣ", "ΚΩΣΤΑΣ"];
const CATS = ["Supermarket", "Καύσιμα", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
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

  // Λογική: Συνολικά 15 μερίδια.
  // Γιώργος: 3/15. Υπόλοιποι (7 άτομα): 4/15 το καθένα.
  const calculateShare = (amount: number) => {
    const total = parseFloat(amount.toString());
    const gShare = (total / 15) * 3;
    const othersShare = (total / 15) * 4;
    return { gShare: gShare.toFixed(2), othersShare: othersShare.toFixed(2) };
  };

  if (!user) {
    return (
      <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'sans-serif', background:'#f0f9ff'}}>
        <h1>ΧΙΟΣ 2026 - LOGIN</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', maxWidth:'400px', width:'100%'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} style={{padding:'15px', borderRadius:'10px', border:'none', background:'#fff', fontWeight:'bold', cursor:'pointer'}}>{u}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'20px', fontFamily:'sans-serif', maxWidth:'600px', margin:'0 auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2>Γεια σου, {user}</h2>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{padding:'5px 10px', background:'#ef4444', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Έξοδος</button>
      </div>

      <h3>Έξοδα Παρέας</h3>
      {ALLOWED_TO_ADD.includes(user) && (
        <button onClick={() => setModal(true)} style={{width:'100%', padding:'15px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', marginBottom:'20px'}}>+ Προσθήκη Εξόδου</button>
      )}

      {expenses.sort((a,b) => b.ts - a.ts).map(e => {
        const { gShare, othersShare } = calculateShare(e.amount);
        return (
          <div key={e.id} style={{border:'1px solid #e2e8f0', margin:'10px 0', padding:'15px', borderRadius:'10px', background:'#fff'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <strong style={{fontSize:'1.1rem'}}>{e.desc}</strong>
              <span>{e.amount}€</span>
            </div>
            <div style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'10px'}}>
              {e.cat} • {new Date(e.ts).toLocaleDateString()} • Από: {e.user}
            </div>
            <div style={{background:'#f1f5f9', padding:'10px', borderRadius:'8px', fontSize:'0.9rem'}}>
              <div>Γιώργος (3/15): <b>{gShare}€</b></div>
              <div>Υπόλοιποι (4/15 ανά άτομο): <b>{othersShare}€</b></div>
            </div>
            {ALLOWED_TO_ADD.includes(user) && (
              <button onClick={() => remove(ref(db, `expenses/${e.id}`))} style={{marginTop:'10px', background:'none', border:'none', color:'red', cursor:'pointer', fontSize:'0.8rem'}}>Διαγραφή</button>
            )}
          </div>
        );
      })}

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
          <form style={{background:'white', padding:'25px', borderRadius:'15px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => { e.preventDefault(); push(ref(db, 'expenses'), { ...form, amount: parseFloat(form.amount), user, ts: Date.now() }); setModal(false); }}>
            <h3>Νέο Έξοδο</h3>
            <select onChange={e => setForm({...form, cat: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
            <input placeholder="Περιγραφή" required onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input type="number" placeholder="Ποσό (€)" required onChange={e => setForm({...form, amount: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <div style={{display:'flex', gap:'10px'}}>
              <button type="submit" style={{flex:1, padding:'10px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'5px'}}>Αποθήκευση</button>
              <button type="button" onClick={() => setModal(false)} style={{flex:1, padding:'10px', background:'#e2e8f0', border:'none', borderRadius:'5px'}}>Άκυρο</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;