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

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f0f9ff', padding:'20px', textAlign:'center', color:'#1e3a8a', fontFamily:'sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h1 style={{marginBottom:'40px'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
              style={{padding:'16px', borderRadius:'12px', border:'none', background:'white', color:'#1e3a8a', fontWeight:'bold', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // APP SCREEN
  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', color:'#1e3a8a', fontFamily:'sans-serif'}}>
      {/* TABS ΠΑΝΩ */}
      <div style={{display:'flex', background:'white', borderBottom:'2px solid #e2e8f0'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => (
          <button key={t} onClick={() => setTab(t)} 
            style={{flex:1, padding:'15px', border:'none', background: tab===t ? '#e0f2fe' : 'white', color: tab===t ? '#0369a1' : '#64748b', fontWeight:'bold'}}>
            {t === 'MAP' ? '📍 ΧΑΡΤΗΣ' : t === 'EXPENSES' ? '💰 ΕΞΟΔΑ' : '📅 ΗΜΕΡΟΛΟΓΙΟ'}
          </button>
        ))}
      </div>

      <div style={{padding:'20px'}}>
        {tab === 'MAP' && (
          <div>
            <div style={{height:'300px', background:'#bae6fd', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0369a1', fontWeight:'bold', border:'2px dashed #0369a1'}}>
              ΧΑΡΤΗΣ ΧΙΟΥ
            </div>
            
            <button onClick={() => setModal(true)} style={{width:'100%', marginTop:'20px', padding:'18px', background:'#0369a1', color:'white', borderRadius:'12px', border:'none', fontWeight:'bold', fontSize:'16px'}}>+ ΠΡΟΣΘΗΚΗ ΣΗΜΕΙΟΥ</button>
            
            <h3 style={{marginTop:'30px', borderBottom:'2px solid #e2e8f0', paddingBottom:'10px'}}>Αποθηκευμένα Σημεία</h3>
            {items.map(i => (
              <div key={i.id} style={{background:'white', padding:'15px', borderRadius:'12px', marginBottom:'10px', border:'1px solid #e2e8f0'}}>
                <div style={{fontWeight:'bold', fontSize:'17px'}}>{i.desc}</div>
                <div style={{fontSize:'14px', color:'#64748b', margin:'5px 0'}}>Κατηγορία: {i.cat}</div>
                {i.link && <a href={i.link} target="_blank" style={{color:'#0369a1', display:'block', marginBottom:'10px'}}>🔗 Επισκεφθείτε το link</a>}
                <button onClick={() => remove(ref(db, `items/${i.id}`))} style={{background:'#fee2e2', border:'none', color:'#b91c1c', padding:'8px 12px', borderRadius:'8px', cursor:'pointer'}}>Διαγραφή</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', padding:'20px', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <form style={{background:'white', padding:'25px', borderRadius:'20px', width:'100%', maxWidth:'400px'}} onSubmit={(e)=>{e.preventDefault(); push(ref(db, 'items'), {...form, user, ts:Date.now()}); setModal(false);}}>
            <h3 style={{marginTop:0, color:'#1e3a8a'}}>Προσθήκη Τοποθεσίας</h3>
            <select onChange={e=>setForm({...form, cat:e.target.value})} style={{width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px'}}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
            <input placeholder="Σχόλια / Τοποθεσία" onChange={e=>setForm({...form, desc:e.target.value})} style={{width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px', boxSizing:'border-box', border:'1px solid #ccc'}} />
            <input placeholder="Link" onChange={e=>setForm({...form, link:e.target.value})} style={{width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px', boxSizing:'border-box', border:'1px solid #ccc'}} />
            <button type="submit" style={{width:'100%', padding:'15px', background:'#0369a1', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold'}}>ΑΠΟΘΗΚΕΥΣΗ</button>
            <button type="button" onClick={()=>setModal(false)} style={{width:'100%', padding:'10px', marginTop:'10px', background:'none', border:'none', color:'#64748b'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;