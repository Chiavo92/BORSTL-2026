
import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MapBoard } from './components/MapBoard';
import { RentalForm } from './components/RentalForm';
import { Modal } from './components/Modal';
import { generateWeeks2026, isDateInWeek } from './services/dateUtils';
import { checkCollision } from './services/collisionService';
import { Rental } from './types';
import { isFirebaseConfigured, rentalsCollection, db } from './services/firebase';
import { 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query,
  QuerySnapshot,
  DocumentData,
  FirestoreError
} from 'firebase/firestore';

const INITIAL_DATA: Rental[] = [
  {
    id: 'demo-1',
    x: 20,
    y: 30,
    tenantName: 'Demo Najemca',
    dateFrom: '2026-01-01',
    dateTo: '2026-01-07',
    description: 'Przykład wynajmu'
  }
];

const App: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [pendingLocation, setPendingLocation] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);

  const weeks = useMemo(() => generateWeeks2026(), []);

  // --- Data Synchronization ---
  useEffect(() => {
    if (isFirebaseConfigured && rentalsCollection) {
      // Real-time synchronization with Firebase
      const q = query(rentalsCollection);
      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Rental));
        setRentals(data);
        setLoading(false);
      }, (error: FirestoreError) => {
        console.error("Firestore error:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Fallback to LocalStorage if Firebase is not configured
      const saved = localStorage.getItem('geoRentals');
      setRentals(saved ? JSON.parse(saved) : INITIAL_DATA);
      setLoading(false);
    }
  }, []);

  // Save to LocalStorage ONLY if Firebase is not used
  useEffect(() => {
    if (!isFirebaseConfigured) {
      localStorage.setItem('geoRentals', JSON.stringify(rentals));
    }
  }, [rentals]);

  const filteredRentals = useMemo(() => {
    if (selectedWeekId === 'all') return rentals;
    const week = weeks.find(w => w.id === selectedWeekId);
    if (!week) return rentals;
    return rentals.filter(r => isDateInWeek(r.dateFrom, r.dateTo, week));
  }, [rentals, selectedWeekId, weeks]);

  // --- Handlers ---
  const handleMapClick = (x: number, y: number, width: number, height: number) => {
    setPendingLocation({ x, y, width, height });
    setEditingRental(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (rental: Rental) => {
    setEditingRental(rental);
    setPendingLocation({ x: rental.x, y: rental.y, width: 2000, height: 1000 });
    setIsModalOpen(true);
  };

  const handleSaveRental = async (data: { tenantName: string; dateFrom: string; dateTo: string; description: string }) => {
    if (!pendingLocation) return;

    const rentalId = editingRental ? editingRental.id : uuidv4();
    const excludeId = editingRental ? editingRental.id : undefined;

    const { collision, conflict } = checkCollision(
      pendingLocation.x,
      pendingLocation.y,
      data.dateFrom,
      data.dateTo,
      rentals,
      pendingLocation.width,
      pendingLocation.height,
      excludeId
    );

    if (collision && conflict) {
      alert(`BŁĄD: Kolizja! W tym miejscu istnieje już wynajem w terminie ${conflict.dateFrom} - ${conflict.dateTo} dla najemcy: ${conflict.tenantName}.`);
      return;
    }

    const rentalData = {
      id: rentalId,
      x: editingRental ? editingRental.x : pendingLocation.x,
      y: editingRental ? editingRental.y : pendingLocation.y,
      ...data
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'rentals', rentalId), rentalData);
      } catch (e) {
        alert("Błąd zapisu w bazie danych. Sprawdź uprawnienia Firestore.");
      }
    } else {
      if (editingRental) {
        setRentals(prev => prev.map(r => r.id === rentalId ? rentalData : r));
      } else {
        setRentals(prev => [...prev, rentalData]);
      }
    }

    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPendingLocation(null);
    setEditingRental(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten wynajem?')) {
      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, 'rentals', id));
      } else {
        setRentals(prev => prev.filter(r => r.id !== id));
      }
    }
  };

  const handleModalDelete = () => {
    if (editingRental) handleDelete(editingRental.id);
    closeModal();
  };

  const centerOnPin = (id: string) => {
    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm z-20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 text-white p-2 rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">BORSTL <span className="text-brand-600">2026</span></h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {isFirebaseConfigured ? 'Synchronizacja Cloud ON' : 'Tryb Lokalny'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label htmlFor="weekFilter" className="text-sm font-medium text-slate-600 whitespace-nowrap">Filtruj tydzień:</label>
            <select
              id="weekFilter"
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full md:w-64 p-2.5"
              value={selectedWeekId}
              onChange={(e) => setSelectedWeekId(e.target.value)}
            >
              <option value="all">Pokaż wszystko</option>
              {weeks.map(week => (
                <option key={week.id} value={week.id}>{week.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-slate-500 animate-pulse">Pobieranie danych z chmury...</p>
          </div>
        ) : (
          <>
            <section className="bg-white rounded-xl shadow-md p-1 border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 mb-1 rounded-t-lg">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Kliknij na mapę (Dodaj) lub na pin (Edytuj). Zmiany widoczne dla wszystkich.
                </p>
              </div>
              <div className="aspect-[2/1] w-full bg-slate-100 rounded-lg overflow-hidden relative">
                <MapBoard 
                    rentals={filteredRentals} 
                    onMapClick={handleMapClick}
                    onPinClick={handleEditClick}
                    highlightedRentalId={highlightedId}
                />
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Lista Rezerwacji ({filteredRentals.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                    <tr>
                      <th scope="col" className="px-6 py-3">Najemca</th>
                      <th scope="col" className="px-6 py-3">Termin</th>
                      <th scope="col" className="px-6 py-3">Opis</th>
                      <th scope="col" className="px-6 py-3 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRentals.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                          Brak rezerwacji w wybranym okresie.
                        </td>
                      </tr>
                    ) : (
                      filteredRentals.map((rental) => (
                        <tr 
                          key={rental.id} 
                          onClick={() => centerOnPin(rental.id)}
                          className={`border-b hover:bg-brand-50 cursor-pointer transition-colors ${highlightedId === rental.id ? 'bg-brand-50 ring-2 ring-inset ring-brand-200' : ''}`}
                        >
                          <td className="px-6 py-4 font-semibold text-slate-900">{rental.tenantName}</td>
                          <td className="px-6 py-4 font-mono text-xs">
                            {rental.dateFrom} <span className="text-slate-400 mx-1">→</span> {rental.dateTo}
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate">{rental.description || '-'}</td>
                          <td className="px-6 py-4 text-right flex justify-end gap-3">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEditClick(rental); }} 
                              className="text-brand-600 hover:text-brand-800 font-medium"
                            >
                              Edytuj
                            </button>
                            <span className="text-slate-200">|</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(rental.id); }} 
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Usuń
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRental ? "Edytuj Rezerwację" : "Nowa Rezerwacja"}>
        <RentalForm 
          initialData={editingRental || undefined}
          onSave={handleSaveRental} 
          onDelete={editingRental ? handleModalDelete : undefined}
          onCancel={closeModal}
        />
      </Modal>

      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} BORSTL System. Real-time data sync powered by Firebase Cloud.
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            Zaprojektowano dla profesjonalnego zarządzania wynajmem.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
