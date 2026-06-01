import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const GOOGLE_API_KEY = "AIzaSyCGAr0Lr3l0MuNqrCm0mkhX8BBjpnD2Sio"; // ⚠️ Μην ξεχάσεις να το βάλεις πάλι!

const MAP_CATS = ["Παραλία", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [mapItems, setMapItems] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  // Προσθέσαμε το πεδίο mapUrl
  const [form, setForm] = useState({ desc: '', cat: 'Παραλία', lat: '', lng: '', mapUrl: '' });
  
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY });

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'mapItems'), (s) => {
        const d = s.val();
        setMapItems(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
      });
    }
  }, [user]);

  // "Έξυπνη" λειτουργία: Διαβάζει το URL
  const handleUrlChange = (url: string) => {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/; // Ψάχνει για το @38.123,26.123 στο link
    const match = url.match(regex);
    if (match) {
      setForm({...form, mapUrl: url, lat: match[1], lng: match[2]});
    } else {
      setForm({...form, mapUrl: url});
    }
  };

  return (
    <div style={{minHeight:'100vh', background:'#f9fafb', fontFamily: "'Inter', sans-serif"}}>
      <div style={{padding:'20px', maxWidth:'600px', margin:'0 auto'}}>
        <button onClick={() => setModal(true)} style={{width:'100%', padding:'14px', background:'#4338ca', color:'white', border:'none', borderRadius:'8px', marginBottom:'20px', cursor:'pointer'}}>+ Προσθήκη τοποθεσίας με Link</button>
        
        {isLoaded ? (
          <GoogleMap mapContainerStyle={{width:'100%', height:'400px', borderRadius:'12px'}} center={{lat: 38.37, lng: 26.00}} zoom={11}>
            {mapItems.map(m => (
                <Marker key={m.id} position={{lat: parseFloat(m.lat), lng: parseFloat(m.lng)}} />
            ))}
          </GoogleMap>
        ) : <p>Φόρτωση χάρτη...</p>}
      </div>

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form style={{background:'white', padding:'25px', borderRadius:'16px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => { 
            e.preventDefault(); 
            push(ref(db, 'mapItems'), { ...form, user });
            setModal(false); setForm({desc:'', cat:'Παραλία', lat:'', lng:'', mapUrl:''});
          }}>
            <h3>Προσθήκη Σημείου</h3>
            <select onChange={e => setForm({...form, cat: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>{MAP_CATS.map(c => <option key={c}>{c}</option>)}</select>
            <input placeholder="Περιγραφή (π.χ. Παραλία Μαύρα Βόλια)" required onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <input placeholder="Επικόλληση Google Maps Link εδώ" onChange={e => handleUrlChange(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', border:'2px solid #4338ca'}} />
            <div style={{fontSize:'12px', color:'#666', marginBottom:'10px'}}>Αυτόματα βρέθηκαν: Lat: {form.lat} / Lng: {form.lng}</div>
            <button type="submit" style={{width:'100%', padding:'12px', background:'#4338ca', color:'white', border:'none', borderRadius:'8px'}}>Αποθήκευση</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;