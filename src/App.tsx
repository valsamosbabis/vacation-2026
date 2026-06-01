import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [activeTab, setActiveTab] = useState('Αξιοθέατα');

  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'sans-serif'}}>
        <h1 style={{fontSize:'2.5rem', marginBottom:'40px', color:'#1e293b'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
              style={{padding:'15px', borderRadius:'12px', border:'none', background:'#fff', boxShadow:'0 2px 4px rgba(0,0,0,0.1)', cursor:'pointer', fontWeight:'bold', fontSize:'14px', transition:'0.2s'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#f1f5f9', fontFamily:'sans-serif'}}>
      <div style={{background:'#fff', padding:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e2e8f0'}}>
        <span style={{fontWeight:'bold', color:'#475569'}}>Χρήστης: {user}</span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{background:'#fee2e2', color:'#b91c1c', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'12px'}}>Έξοδος</button>
      </div>

      <div style={{display:'flex', gap:'5px', padding:'10px'}}>
        {['Αξιοθέατα', 'Έξοδα', 'Ημερολόγιο'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{flex:1, padding:'12px', border:'none', borderRadius:'8px', background: activeTab === tab ? '#4f46e5' : '#fff', color: activeTab === tab ? '#fff' : '#64748b', cursor:'pointer', fontWeight:'600'}}>{tab}</button>
        ))}
      </div>

      <div style={{padding:'20px'}}>
        {activeTab === 'Αξιοθέατα' && <SightsView />}
        {activeTab === 'Έξοδα' && <div style={{textAlign:'center', marginTop:'50px', color:'#64748b'}}>Σελίδα Εξόδων υπό κατασκευή...</div>}
        {activeTab === 'Ημερολόγιο' && <div style={{textAlign:'center', marginTop:'50px', color:'#64748b'}}>Σελίδα Ημερολογίου υπό κατασκευή...</div>}
      </div>
    </div>
  );
};

const SightsView = () => {
  const [subTab, setSubTab] = useState('Παραλίες');
  const [modal, setModal] = useState(false);
  const [mapItems, setMapItems] = useState<any[]>([]);
  const [form, setForm] = useState({ desc: '', link: '', comments: '' });

  useEffect(() => {
    onValue(ref(db, 'mapItems'), (s) => {
      const d = s.val();
      setMapItems(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
    });
  }, []);

  const filteredItems = mapItems.filter(i => i.cat === subTab);

  return (
    <div>
      <div style={{display:'flex', gap:'5px', marginBottom:'20px'}}>
        {['Παραλίες', 'Εστιατόρια', 'Άλλο'].map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{flex:1, padding:'10px', background: subTab === t ? '#6366f1' : '#fff', border:'1px solid #e2e8f0', borderRadius:'6px', cursor:'pointer', color: subTab === t ? '#fff' : '#475569'}}>{t}</button>
        ))}
      </div>

      <button onClick={() => setModal(true)} style={{width:'100%', padding:'12px', background:'#22c55e', color:'white', border:'none', borderRadius:'8px', marginBottom:'20px', fontWeight:'bold'}}>+ Προσθήκη σε {subTab}</button>

      {filteredItems.map(item => (
        <div key={item.id} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
          <h4 style={{margin:'0 0 5px 0'}}>{item.desc}</h4>
          {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{color:'#4f46e5', fontSize:'13px'}}>Δες στο χάρτη</a>}
          <p style={{fontSize:'14px', color:'#475569', margin:'5px 0'}}>{item.comments}</p>
          <button onClick={() => remove(ref(db, 'mapItems/' + item.id))} style={{background:'none', border:'none', color:'#ef4444', fontSize:'12px', cursor:'pointer', padding:0, marginTop:'5px'}}>Διαγραφή</button>
        </div>
      ))}

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form style={{background:'white', padding:'25px', borderRadius:'16px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => {
            e.preventDefault();
            push(ref(db, 'mapItems'), { ...form, cat: subTab });
            setModal(false); setForm({desc:'', link:'', comments:''});
          }}>
            <h3 style={{marginTop:0}}>Προσθήκη στο {subTab}</h3>
            <input placeholder="Όνομα/Περιγραφή" required value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input placeholder="Google Maps Link" value={form.link} onChange={e => setForm({...form, link: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <textarea placeholder="Σχόλια" value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box', height:'80px'}} />
            <div style={{display:'flex', gap:'10px'}}>
                <button type="button" onClick={() => setModal(false)} style={{flex:1, padding:'10px', border:'1px solid #ccc', borderRadius:'8px', cursor:'pointer'}}>Άκυρο</button>
                <button type="submit" style={{flex:1, padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>Αποθήκευση</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;