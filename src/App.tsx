import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { db } from './firebase';
import { ref, push, onValue } from 'firebase/database';

const GOOGLE_API_KEY = "AIzaSyCGAr0Lr3l0MuNqrCm0mkhX8BBjpnD2Sio";
const LIBRARIES: any = ['places'];
const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [activeTab, setActiveTab] = useState('Αξιοθέατα');

  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px'}}>
        <h1 style={{fontSize:'3rem', marginBottom:'40px'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} style={{padding:'20px', borderRadius:'15px', border:'none', background:'#fff', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', cursor:'pointer', fontSize:'16px', fontWeight:'bold'}}>{u}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#f1f5f9'}}>
      <div style={{background:'#fff', padding:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e2e8f0'}}>
        <span style={{fontWeight:'bold'}}>Χρήστης: {user}</span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{background:'#fee2e2', color:'#b91c1c', border:'none', padding:'8px 12px', borderRadius:'6px', cursor:'pointer'}}>Έξοδος</button>
      </div>

      <div style={{display:'flex', gap:'5px', padding:'10px'}}>
        {['Αξιοθέατα', 'Έξοδα', 'Ημερολόγιο'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{flex:1, padding:'15px', border:'none', borderRadius:'8px', background: activeTab === tab ? '#4338ca' : '#fff', color: activeTab === tab ? '#fff' : '#000', cursor:'pointer'}}>{tab}</button>
        ))}
      </div>

      <div style={{padding:'20px'}}>
        {activeTab === 'Αξιοθέατα' && <SightsView user={user} />}
        {activeTab === 'Έξοδα' && <div style={{textAlign:'center'}}>Σελίδα Εξόδων</div>}
        {activeTab === 'Ημερολόγιο' && <div style={{textAlign:'center'}}>Σελίδα Ημερολογίου</div>}
      </div>
    </div>
  );
};

const SightsView = ({ user }: { user: string | null }) => {
  const [subTab, setSubTab] = useState('Παραλίες');
  const [modal, setModal] = useState(false);
  const [mapItems, setMapItems] = useState<any[]>([]);
  const [form, setForm] = useState({ desc: '', link: '', comments: '', lat: '', lng: '', cat: 'Παραλίες' });
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY, libraries: LIBRARIES });

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
          <button key={t} onClick={() => setSubTab(t)} style={{flex:1, padding:'10px', background: subTab === t ? '#6366f1' : '#fff', border:'none', borderRadius:'6px', cursor:'pointer'}}>{t}</button>
        ))}
      </div>

      <button onClick={() => setModal(true)} style={{width:'100%', padding:'12px', background:'#10b981', color:'white', border:'none', borderRadius:'8px', marginBottom:'20px'}}>+ Προσθήκη σε {subTab}</button>

      {isLoaded && (
        <GoogleMap mapContainerStyle={{width:'100%', height:'300px', borderRadius:'12px'}} center={{lat: 38.37, lng: 26.00}} zoom={11}>
          {filteredItems.map(m => <Marker key={m.id} position={{lat: parseFloat(m.lat), lng: parseFloat(m.lng)}} />)}
        </GoogleMap>
      )}

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form style={{background:'white', padding:'25px', borderRadius:'16px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => {
            e.preventDefault();
            push(ref(db, 'mapItems'), { ...form, cat: subTab, user });
            setModal(false); setForm({desc:'', link:'', comments:'', lat:'', lng:'', cat: subTab});
          }}>
            <h3>Προσθήκη στο {subTab}</h3>
            <Autocomplete onLoad={(ac) => setAutocomplete(ac)} onPlaceChanged={() => {
              const p = autocomplete.getPlace();
              if (p.geometry) setForm({...form, desc: p.name, lat: p.geometry.location.lat(), lng: p.geometry.location.lng()});
            }}>
              <input placeholder="Αναζήτηση μέρους" style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            </Autocomplete>
            <input placeholder="Σύνδεσμος (Link)" value={form.link} onChange={e => setForm({...form, link: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <textarea placeholder="Σχόλια" value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <button type="submit" style={{width:'100%', padding:'12px', background:'#4338ca', color:'white', border:'none', borderRadius:'8px'}}>Αποθήκευση</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;