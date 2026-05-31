import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const CATEGORIES = ["Παραλία", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('chios_user'));
  const [tab, setTab] = useState('MAP');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('Άλλο');

  useEffect(() => {
    onValue(ref(db, 'expenses'), (snap) => {
      const data = snap.val();
      setExpenses(data ? Object.entries(data).map(([id, v]: any) => ({ id, ...v })) : []);
    });
  }, []);

  if (!user) return (
    <div className="min-h-screen bg-blue-900 p-6 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-10">ΧΙΟΣ 2026</h1>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {USERS.map(u => <button key={u} onClick={()=>{setUser(u); localStorage.setItem('chios_user', u)}} className="bg-white text-blue-900 p-4 rounded-xl font-bold shadow-lg">{u}</button>)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Content */}
      <div className="p-4">
        {tab === 'MAP' && (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Χάρτης Χίου</h2>
            <div className="w-full h-64 bg-blue-100 rounded-2xl flex items-center justify-center border-2 border-blue-200">
              [Χάρτης Χίου - Κεντρική Τοποθεσία]
            </div>
            <button onClick={() => setIsModalOpen(true)} className="mt-6 w-full bg-blue-600 text-white p-4 rounded-2xl font-bold">Προσθήκη Εξόδου</button>
          </div>
        )}
        
        {tab === 'EXPENSES' && (
          <div>
            {expenses.map(e => (
              <div key={e.id} className="bg-white p-4 rounded-xl mb-2 flex justify-between items-center shadow-sm">
                <div><p className="font-bold">{e.desc}</p><p className="text-xs text-slate-400">{e.cat} - {e.user}</p></div>
                <div className="flex items-center gap-3"><span>€{e.amount}</span><button onClick={() => remove(ref(db, `expenses/${e.id}`))}>✕</button></div>
              </div>
            ))}
          </div>
        )}

        {tab === 'CALENDAR' && <div className="p-10 text-center text-slate-400">Ημερολόγιο - Υπό ανάπτυξη</div>}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t flex justify-around p-4">
        <button onClick={() => setTab('MAP')}>📍 Χάρτης</button>
        <button onClick={() => setTab('EXPENSES')}>💰 Έξοδα</button>
        <button onClick={() => setTab('CALENDAR')}>📅 Ημερολόγιο</button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 p-4 flex items-center">
          <form className="bg-white p-6 rounded-2xl w-full" onSubmit={(e) => {
            e.preventDefault();
            push(ref(db, 'expenses'), { amount, desc, cat, user, ts: Date.now() });
            setIsModalOpen(false);
          }}>
            <select className="w-full p-2 mb-2 bg-slate-100 rounded" onChange={e => setCat(e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
            <input className="w-full p-2 mb-2 bg-slate-100 rounded" placeholder="Ποσό" onChange={e => setAmount(e.target.value)} />
            <input className="w-full p-2 mb-4 bg-slate-100 rounded" placeholder="Σχόλια" onChange={e => setDesc(e.target.value)} />
            <button className="w-full bg-blue-900 text-white p-3 rounded-xl">Αποθήκευση</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;