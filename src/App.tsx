import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const CATS = ["Παραλία", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('MAP');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ amount: '', desc: '', cat: 'Παραλία', link: '' });

  // Έλεγχος χρήστη κατά την εκκίνηση
  useEffect(() => {
    const savedUser = localStorage.getItem('chios_user');
    if (savedUser) setUser(savedUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'expenses'), (s) => {
        const d = s.val();
        setExpenses(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
      });
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem('chios_user');
    setUser(null);
  };

  // LOADING STATE
  if (loading) return <div style={{padding: '20px', textAlign: 'center'}}>Φόρτωση...</div>;

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#0f172a', padding:'20px', textAlign:'center', color:'white', fontFamily:'sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h1 style={{fontSize:'32px', marginBottom:'40px'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
              style={{padding:'15px', borderRadius:'12px', border:'none', fontWeight:'bold', cursor:'pointer', background:'white', color:'#0f172a'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', paddingBottom:'80px', fontFamily:'sans-serif'}}>
      <div style={{background:'#1e3a8a', color:'white', padding:'15px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span>Χρήστης: <strong>{user}</strong></span>
        <button onClick={logout} style={{background:'transparent', border:'1px solid white', color:'white', padding:'5px 10px', borderRadius:'5px'}}>Exit</button>
      </div>

      <div style={{padding:'20px'}}>
        {tab === 'MAP' && (
          <div>
            <h2 style={{textAlign:'center'}}>Χάρτης Χίου</h2>
            <div style={{height:'300px', background:'#bae6fd', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', border:'2px dashed #0284c7'}}>Χάρτης (Κέντρο: Χίος)</div>
            <button onClick={() => setModal(true)} style={{width:'100%', marginTop:'20px', padding:'15px', background:'#1e3a8a', color:'white', borderRadius:'15px', border:'none', fontSize:'18px'}}>+ Προσθήκη</button>
          </div>
        )}
        {tab === 'EXPENSES' && (
          <div>
            <h2 style={{textAlign:'center'}}>Έξοδα</h2>
            {expenses.map(e => (
              <div key={e.id} style={{background:'white', padding:'15px', borderRadius:'12px', marginBottom:'10px', display:'flex', justifyContent:'space-between'}}>
                <div><strong>{e.desc}</strong><br/><small>{e.cat} - {e.amount}€</small></div>
                <button onClick={() => remove(ref(db, `expenses/${e.id}`))} style={{background:'#fee2e2', border:'none', padding:'5px 10px', borderRadius:'5px'}}>✕</button>
              </div>
            ))}
          </div>
        )}
        {tab === 'CALENDAR' && <div style={{textAlign:'center', marginTop:'50px'}}>Ημερολόγιο</div>}
      </div>

      <div style={{position:'fixed', bottom:0, width:'100%', background:'white', display:'flex', borderTop:'1px solid #e2e8f0'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:'15px', border:'none', background: tab===t ? '#f1f5f9' : 'white', cursor:'pointer'}}>{t === 'MAP' ? '📍 Χάρτης' : t === 'EXPENSES' ? '💰 Έξοδα' : '📅 Ημερολόγιο'}</button>
        ))}
      </div>

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', padding:'20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <form style={{background:'white', padding:'20px', borderRadius:'20px', width:'100%', maxWidth:'400px'}} onSubmit={(e)=>{e.preventDefault(); push(ref(db, 'expenses'), {...form, user, ts:Date.now()}); setModal(false);}}>
            <h3>Νέα Καταχώρηση</h3>
            <select onChange={e=>setForm({...form, cat:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
            <input placeholder="Ποσό" onChange={e=>setForm({...form, amount:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <input placeholder="Σχόλια" onChange={e=>setForm({...form, desc:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <button type="submit" style={{width:'100%', padding:'15px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'10px'}}>Αποθήκευση</button>
            <button type="button" onClick={()=>setModal(false)} style={{width:'100%', padding:'10px', marginTop:'10px', background:'none', border:'none', color:'red'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;