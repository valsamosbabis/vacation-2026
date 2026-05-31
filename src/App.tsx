import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const CATS = ["Παραλία", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(null);
  const [tab, setTab] = useState('MAP');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ amount: '', desc: '', cat: 'Παραλία', link: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('chios_user');
    if (savedUser) setUser(savedUser);
  }, []);

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'expenses'), (s) => {
        const d = s.val();
        setExpenses(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
      });
    }
  }, [user]);

  // LOGIN SCREEN - Φωτεινό Design
  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f0f9ff', padding:'20px', textAlign:'center', fontFamily:'sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h1 style={{fontSize:'36px', color:'#1e3a8a', marginBottom:'40px'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
              style={{padding:'16px', borderRadius:'15px', border:'1px solid #bae6fd', fontWeight:'bold', cursor:'pointer', background:'white', color:'#0369a1'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', paddingBottom:'80px', fontFamily:'sans-serif'}}>
      <div style={{background:'#1e3a8a', color:'white', padding:'15px', display:'flex', justifyContent:'space-between'}}>
        <span>Χρήστης: <strong>{user}</strong></span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{background:'none', border:'none', color:'white'}}>Exit</button>
      </div>

      <div style={{padding:'20px'}}>
        {tab === 'MAP' && (
          <div>
            <h2 style={{textAlign:'center'}}>Χάρτης Χίου</h2>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d200424.41432439818!2d25.861759086111116!3d38.35821213455913!2m3!1f0!2f0!3m0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a34b8c9d0b668f%3A0x400bd2ce2b988f0!2sChios!5e0!3m2!1sen!2sgr!4v1717180000000" 
              width="100%" height="300" style={{border:0, borderRadius:'20px'}} allowFullScreen loading="lazy"></iframe>
            <button onClick={() => setModal(true)} style={{width:'100%', marginTop:'20px', padding:'18px', background:'#0369a1', color:'white', borderRadius:'15px', border:'none', fontSize:'18px', fontWeight:'bold'}}>+ Προσθήκη</button>
          </div>
        )}
        {tab === 'EXPENSES' && (
          <div>
            <h2 style={{textAlign:'center'}}>Έξοδα</h2>
            {expenses.map(e => (
              <div key={e.id} style={{background:'white', padding:'15px', borderRadius:'12px', marginBottom:'10px', boxShadow:'0 1px 2px rgba(0,0,0,0.1)'}}>
                <div style={{fontWeight:'bold'}}>{e.desc} ({e.cat})</div>
                <div style={{fontSize:'14px'}}>{e.amount}€ - <a href={e.link} target="_blank">Link</a></div>
                <button onClick={() => remove(ref(db, `expenses/${e.id}`))} style={{marginTop:'5px', background:'#fee2e2', border:'none', padding:'5px 10px', borderRadius:'5px'}}>Διαγραφή</button>
              </div>
            ))}
          </div>
        )}
        {tab === 'CALENDAR' && <p style={{textAlign:'center'}}>Ημερολόγιο</p>}
      </div>

      <div style={{position:'fixed', bottom:0, width:'100%', background:'white', display:'flex', borderTop:'1px solid #e2e8f0'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:'15px', border:'none', background: tab===t ? '#f1f5f9' : 'white', cursor:'pointer'}}>{t === 'MAP' ? '📍 Χάρτης' : t === 'EXPENSES' ? '💰 Έξοδα' : '📅 Ημερολόγιο'}</button>
        ))}
      </div>

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', padding:'20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <form style={{background:'white', padding:'25px', borderRadius:'20px', width:'100%', maxWidth:'400px'}} onSubmit={(e)=>{e.preventDefault(); push(ref(db, 'expenses'), {...form, user, ts:Date.now()}); setModal(false);}}>
            <h3>Νέα Καταχώρηση</h3>
            <select onChange={e=>setForm({...form, cat:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
            <input placeholder="Ποσό" onChange={e=>setForm({...form, amount:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input placeholder="Σχόλια" onChange={e=>setForm({...form, desc:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input placeholder="Link" onChange={e=>setForm({...form, link:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <button type="submit" style={{width:'100%', padding:'15px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'10px'}}>Αποθήκευση</button>
            <button type="button" onClick={()=>setModal(false)} style={{width:'100%', padding:'10px', marginTop:'10px', background:'none', border:'none', color:'red'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;