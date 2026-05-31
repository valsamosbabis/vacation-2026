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

  // Υπολογισμός μεριδίων: Γιώργος 3/15, Υπόλοιποι (7 άτομα) από 4/15
  const calculateShare = (amount: number) => {
    const total = parseFloat(amount.toString());
    const gShare = (total / 15) * 3;
    const othersShare = (total / 15) * 4;
    return { gShare: gShare.toFixed(2), othersShare: othersShare.toFixed(2) };
  };

  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f0f9ff', padding:'20px', textAlign:'center', fontFamily:'sans-serif'}}>
        <h1>ΧΙΟΣ 2026 - LOGIN</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', maxWidth:'400px', margin:'0 auto'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} style={{padding:'15px', borderRadius:'10px', border:'none', background:'#fff', fontWeight:'bold', cursor:'pointer'}}>{u}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', padding:'20px', fontFamily:'sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#1e3a8a', padding:'15px', borderRadius:'10px', color:'white', marginBottom:'20px'}}>
        <span>User: <strong>{user}</strong></span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{background:'#dc2626', color:'white', border:'none', padding:'8px 12px', borderRadius:'5px', cursor:'pointer'}}>Έξοδος</button>
      </div>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2>Έξοδα Παρέας</h2>
        {ALLOWED_TO_ADD.includes(user) && (
          <button onClick={() => setModal(true)} style={{padding:'10px 20px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>+ Προσθήκη</button>
        )}
      </div>

      {expenses.map(e => {
        const { gShare, othersShare } = calculateShare(e.amount);
        return (
          <div key={e.id} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', border:'1px solid #e2e8f0'}}>
            <div style={{fontWeight:'bold'}}>{e.desc} - {e.amount}€ ({e.cat})</div>
            <div style={{fontSize:'12px', color:'#64748b'}}>Ημερομηνία: {new Date(e.ts).toLocaleDateString()} | Από: {e.user}</div>
            <div style={{marginTop:'10px', background:'#f0f9ff', padding:'8px', borderRadius:'5px', fontSize:'14px'}}>
              <strong>Μερίδια:</strong> Γιώργος: {gShare}€ | Υπόλοιποι (ανά άτομο): {othersShare}€
            </div>
            {ALLOWED_TO_ADD.includes(user) && <button onClick={() => remove(ref(db, `expenses/${e.id}`))} style={{marginTop:'10px', color:'red', background:'none', border:'none', cursor:'pointer'}}>Διαγραφή</button>}
          </div>
        );
      })}

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
          <form style={{background:'white', padding:'25px', borderRadius:'15px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => { e.preventDefault(); push(ref(db, 'expenses'), { ...form, amount: parseFloat(form.amount), user, ts: Date.now() }); setModal(false); }}>
            <h3>Νέο Έξοδο</h3>
            <select onChange={e => setForm({...form, cat: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
            <input placeholder="Περιγραφή (π.χ. Βενζίνη)" onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input type="number" placeholder="Ποσό (€)" onChange={e => setForm({...form, amount: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <button type="submit" style={{width:'100%', padding:'12px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>Αποθήκευση</button>
            <button type="button" onClick={() => setModal(false)} style={{width:'100%', padding:'10px', marginTop:'10px', background:'none', border:'none', cursor:'pointer'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;