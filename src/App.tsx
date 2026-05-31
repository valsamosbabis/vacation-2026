import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const CATS = ["Παραλία", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('chios_user'));
  const [tab, setTab] = useState('MAP');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ amount: '', desc: '', cat: 'Παραλία', link: '' });

  useEffect(() => {
    onValue(ref(db, 'expenses'), (s) => {
      const d = s.val();
      setExpenses(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
    });
  }, []);

  if (!user) return (
    <div style={{minHeight:'100vh', background:'#1e3a8a', padding:'20px', textAlign:'center', color:'white', fontFamily:'sans-serif'}}>
      <h1 style={{fontSize:'32px', margin:'40px 0'}}>ΧΙΟΣ 2026</h1>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
        {USERS.map(u => <button key={u} onClick={()=>{setUser(u); localStorage.setItem('chios_user', u)}} style={{padding:'15px', borderRadius:'10px', border:'none', fontWeight:'bold'}}>{u}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh', fontFamily:'sans-serif', background:'#f8fafc', paddingBottom:'80px'}}>
      {/* Content */}
      <div style={{padding:'20px'}}>
        {tab === 'MAP' && (
          <div>
            <h2 style={{textAlign:'center'}}>Χάρτης Χίου</h2>
            <div style={{height:'300px', background:'#bae6fd', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', border:'2px dashed #0284c7'}}>
              [Κέντρο Χίου - Google Maps Placeholder]
            </div>
            <button onClick={() => setModal(true)} style={{width:'100%', marginTop:'20px', padding:'15px', background:'#1e3a8a', color:'white', borderRadius:'15px', border:'none', fontSize:'18px'}}>+ Προσθήκη</button>
          </div>
        )}

        {tab === 'EXPENSES' && (
          <div>
            <h2>Έξοδα</h2>
            {expenses.map(e => (
              <div key={e.id} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', display:'flex', justifyContent:'space-between'}}>
                <div><strong>{e.desc}</strong><br/>{e.cat} - {e.amount}€</div>
                <button onClick={() => remove(ref(db, `expenses/${e.id}`))}>✕</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'CALENDAR' && <p style={{textAlign:'center', marginTop:'50px'}}>Ημερολόγιο</p>}
      </div>

      {/* Tabs */}
      <div style={{position:'fixed', bottom:0, width:'100%', background:'white', display:'flex', borderTop:'1px solid #ddd'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:'15px', border:'none', background: tab===t ? '#e2e8f0' : 'white'}}>{t}</button>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', padding:'20px', display:'flex', alignItems:'center'}}>
          <form style={{background:'white', padding:'20px', borderRadius:'20px', width:'100%'}} onSubmit={(e)=>{e.preventDefault(); push(ref(db, 'expenses'), {...form, user, ts:Date.now()}); setModal(false);}}>
            <select onChange={e=>setForm({...form, cat:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
            <input placeholder="Ποσό" onChange={e=>setForm({...form, amount:e.target.value})} style={{display:'block', width:'100%', margin:'10px 0'}} />
            <input placeholder="Σχόλια" onChange={e=>setForm({...form, desc:e.target.value})} style={{display:'block', width:'100%', margin:'10px 0'}} />
            <input placeholder="Link" onChange={e=>setForm({...form, link:e.target.value})} style={{display:'block', width:'100%', margin:'10px 0'}} />
            <button type="submit" style={{width:'100%', padding:'15px'}}>Αποθήκευση</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;