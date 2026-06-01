import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

// ΒΑΛΕ ΕΔΩ ΤΟ API KEY ΣΟΥ
const GOOGLE_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const MAP_CATS = ["Παραλία", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [mapItems, setMapItems] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ desc: '', cat: 'Παραλία', lat: '', lng: '' });
  
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY });

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'mapItems'), (s) => {
        const d = s.val();
        setMapItems(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
      });
    }
  }, [user]);

  const fontStyle = { fontFamily: "'Inter', -apple-system, sans-serif", color: "#334155" };

  if (!user) return (
    <div style={{...fontStyle, minHeight:'100vh', padding:'60px 20px', background:'#f8fafc', textAlign:'center'}}>
      <h1 style={{fontSize:'2.5rem', marginBottom:'40px', color:'#1e293b'}}>ΧΙΟΣ 2026</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'15px', maxWidth:'500px', margin:'0 auto'}}>
        {USERS.map(u => (
          <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
            style={{padding:'20px', borderRadius:'12px', border:'none', background:'#fff', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)', cursor:'pointer', fontSize:'16px', fontWeight:'600'}}>
            {u}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{...fontStyle, minHeight:'100vh', background:'#f9fafb', paddingBottom:'50px'}}>
      <div style={{background:'#fff', padding:'15px 20px', display:'flex', justifyContent:'space-between', borderBottom:'1px solid #e5e7eb'}}>
        <span>Σύνδεση: <strong>{user}</strong></span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{cursor:'pointer', border:'none', background:'none'}}>Έξοδος</button>
      </div>

      <div style={{padding:'20px', maxWidth:'600px', margin:'0 auto'}}>
        <button onClick={() => setModal(true)} style={{width:'100%', padding:'14px', background:'#4338ca', color:'white', border:'none', borderRadius:'8px', marginBottom:'20px', cursor:'pointer', fontWeight:'600'}}>+ Προσθήκη Pin στον Χάρτη</button>
        
        {isLoaded ? (
          <GoogleMap mapContainerStyle={{width:'100%', height:'400px', borderRadius:'12px'}} center={{lat: 38.37, lng: 26.00}} zoom={11}>
            {mapItems.map(m => (
                <Marker key={m.id} position={{lat: parseFloat(m.lat), lng: parseFloat(m.lng)}} />
            ))}
          </GoogleMap>
        ) : <p>Φόρτωση χάρτη...</p>}

        <h3 style={{marginTop:'30px'}}>Τα Pins μου:</h3>
        {mapItems.map(m => (
          <div key={m.id} style={{background:'#fff', padding:'15px', borderRadius:'10px', marginBottom:'10px', border:'1px solid #e5e7eb'}}>
            <strong>{m.cat}</strong>: {m.desc} 
            <button onClick={() => remove(ref(db, `mapItems/${m.id}`))} style={{marginLeft:'10px', color:'red', border:'none', background:'none', cursor:'pointer'}}>Διαγραφή</button>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form style={{background:'white', padding:'25px', borderRadius:'16px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => { 
            e.preventDefault(); 
            push(ref(db, 'mapItems'), { ...form, user });
            setModal(false); setForm({desc:'', cat:'Παραλία', lat:'', lng:''});
          }}>
            <select onChange={e => setForm({...form, cat: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>{MAP_CATS.map(c => <option key={c}>{c}</option>)}</select>
            <input placeholder="Περιγραφή" required onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <input placeholder="Latitude (π.χ. 38.37)" required onChange={e => setForm({...form, lat: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <input placeholder="Longitude (π.χ. 26.00)" required onChange={e => setForm({...form, lng: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <button type="submit" style={{width:'100%', padding:'12px', background:'#4338ca', color:'white', border:'none', borderRadius:'8px'}}>Αποθήκευση</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;