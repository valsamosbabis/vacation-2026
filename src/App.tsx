import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const GOOGLE_API_KEY = "AIzaSyCGAr0Lr3l0MuNqrCm0mkhX8BBjpnD2Sio";
const LIBRARIES: any = ['places'];
const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [activeTab, setActiveTab] = useState('Αξιοθέατα'); // Tab state

  // Loader για χάρτες
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY, libraries: LIBRARIES });

  // Σελίδα 1: Επιλογή Χρήστη
  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px'}}>
        <h1 style={{fontSize:'3rem', marginBottom:'40px', color:'#1e293b'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
              style={{padding:'20px', fontSize:'18px', fontWeight:'bold', borderRadius:'15px', border:'none', background:'#fff', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', cursor:'pointer'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Σελίδα 2: Dashboard με Tabs
  return (
    <div style={{minHeight:'100vh', background:'#f1f5f9'}}>
      {/* Header */}
      <div style={{background:'#fff', padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e2e8f0'}}>
        <span style={{fontWeight:'bold'}}>Χρήστης: {user}</span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{border:'none', background:'none', color:'red', cursor:'pointer'}}>Έξοδος</button>
      </div>

      {/* Tabs Navigation */}
      <div style={{display:'flex', gap:'5px', padding:'10px'}}>
        {['Αξιοθέατα', 'Έξοδα', 'Ημερολόγιο'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} 
            style={{flex:1, padding:'15px', border:'none', borderRadius:'8px', background: activeTab === tab ? '#4338ca' : '#fff', color: activeTab === tab ? '#fff' : '#000', cursor:'pointer', fontWeight:'600'}}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{padding:'20px'}}>
        {activeTab === 'Αξιοθέατα' && <SightsView isLoaded={isLoaded} />}
        {activeTab === 'Έξοδα' && <div style={{textAlign:'center', padding:'40px'}}>Σελίδα Εξόδων (Υπό κατασκευή)</div>}
        {activeTab === 'Ημερολόγιο' && <div style={{textAlign:'center', padding:'40px'}}>Σελίδα Ημερολογίου (Υπό κατασκευή)</div>}
      </div>
    </div>
  );
};

// Component για τα Αξιοθέατα
const SightsView = ({ isLoaded }: { isLoaded: boolean }) => {
    // Εδώ βάζεις τον κώδικα για τον χάρτη που φτιάξαμε πριν
    return (
        <div>
            {isLoaded ? (
                <GoogleMap mapContainerStyle={{width:'100%', height:'500px', borderRadius:'12px'}} center={{lat: 38.37, lng: 26.00}} zoom={11}>
                    {/* Markers εδώ */}
                </GoogleMap>
            ) : <p>Φόρτωση χάρτη...</p>}
        </div>
    );
}

export default App;