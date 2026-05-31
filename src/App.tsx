import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const CATS = ["Παραλία", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [tab, setTab] = useState('MAP');
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ desc: '', cat: 'Παραλία', link: '' });

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'items'), (s) => {
        const d = s.val();
        setItems(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
      });
    }
  }, [user]);

  // ΟΘΟΝΗ LOGIN
  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f0f9ff', padding:'20px', textAlign:'center', color:'#1e3a8a', fontFamily:'sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h1 style={{fontSize:'2rem', marginBottom:'2rem'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
              style={{padding:'20px', borderRadius:'15px', border:'2px solid #1e3a8a', background:'white', color:'#1e3a8a', fontWeight:'bold', fontSize:'1rem', cursor:'pointer'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ΚΥΡΙΑ ΟΘΟΝΗ
  return (
    <div style={{minHeight:'100vh', background:'#ffffff', color:'#1e3a8a', fontFamily:'sans-serif'}}>
      {/* TABS ΠΑΝΩ */}
      <div style={{display:'flex', borderBottom:'3px solid #1e3a8a', background:'#f8fafc'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => (
          <button key={t} onClick={() => setTab(t)} 
            style={{flex:1, padding:'20px', border:'none', background: tab===t ? '#1e3a8a' : 'transparent', color: tab===t ? 'white' : '#1e3a8a', fontWeight:'bold', fontSize:'1rem', cursor:'pointer'}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{padding:'20px'}}>
        {tab === 'MAP' && (
          <div>
            <div style={{height:'300px', background:'#e2e8f0', borderRadius:'15px', display:'flex', alignItems:'center', justifyContent:'center', color:'#1e3a8a', fontWeight:'bold', fontSize:'1.2rem', border:'3px solid #1e3a8a', marginBottom:'20px'}}>
              ΧΑΡΤΗΣ ΧΙΟΥ
            </div>
            <button onClick={() => setModal(true)} style={{width:'100%', padding:'20px', background:'#1e3a8a', color:'white', borderRadius:'15px', border:'none', fontWeight:'bold', fontSize:'1.1rem', cursor:'pointer'}}>+ ΠΡΟΣΘΗΚΗ</button>
            
            <div style={{marginTop:'30px'}}>
              <h2 style={{color:'#1e3a8a', borderBottom:'2px solid #1e3a8a', paddingBottom:'10px'}}>Αποθηκευμένα Σημεία</h2>
              {items.map(i => (
                <div key={i.id} style={{background:'#f8fafc', padding:'20px', borderRadius:'15px', marginBottom:'15px', border:'1px solid #1e3a8a'}}>
                  <strong style={{fontSize:'1.2rem'}}>{i.desc}</strong>
                  <div style={{margin:'10px 0', color:'#475569'}}>Κατηγορία: {i.cat}</div>
                  {i.link && <a href={i.link} target="_blank" style={{color:'#0369a1', fontWeight:'bold'}}>🔗 Δείτε το Link</a>}
                  <button onClick={() => remove(ref(db, `items/${i.id}`))} style={{display:'block', marginTop:'15px', padding:'10px', background:'#dc2626', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>Διαγραφή</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', padding:'20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <form style={{background:'white', padding:'30px', borderRadius:'20px', width:'100%', maxWidth:'400px'}} onSubmit={(e)=>{e.preventDefault(); push(ref(db, 'items'), {...form, user}); setModal(false);}}>
            <h2 style={{marginTop:0, color:'#1e3a8a'}}>Νέα Τοποθεσία</h2>
            <select onChange={e=>setForm({...form, cat:e.target.value})} style={{width:'100%', padding:'15px', marginBottom:'15px', borderRadius:'10px', fontSize:'1rem'}}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
            <input placeholder="Σχόλια" onChange={e=>setForm({...form, desc:e.target.value})} style={{width:'100%', padding:'15px', marginBottom:'15px', borderRadius:'10px', fontSize:'1rem', boxSizing:'border-box'}} />
            <input placeholder="Link" onChange={e=>setForm({...form, link:e.target.value})} style={{width:'100%', padding:'15px', marginBottom:'15px', borderRadius:'10px', fontSize:'1rem', boxSizing:'border-box'}} />
            <button type="submit" style={{width:'100%', padding:'20px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', fontSize:'1.1rem', cursor:'pointer'}}>ΑΠΟΘΗΚΕΥΣΗ</button>
            <button type="button" onClick={()=>setModal(false)} style={{width:'100%', padding:'15px', marginTop:'10px', background:'transparent', border:'none', color:'#dc2626', fontWeight:'bold', cursor:'pointer'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;