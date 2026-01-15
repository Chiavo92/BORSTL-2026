import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MapBoard } from './components/MapBoard';
import { RentalForm } from './components/RentalForm';
import { Modal } from './components/Modal';
import { generateWeeks2026, isDateInWeek } from './services/dateUtils';
import { checkCollision } from './services/collisionService';
import { Rental } from './types';

// Initial dummy data for demonstration
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
  // --- State ---
  const [rentals, setRentals] = useState<Rental[]>(() => {
    const saved = localStorage.getItem('geoRentals');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  
  const [selectedWeekId, setSelectedWeekId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  // Pending pin location when clicking the map
  const [pendingLocation, setPendingLocation] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  // --- Computed ---
  const weeks = useMemo(() => generateWeeks2026(), []);

  const filteredRentals = useMemo(() => {
    if (selectedWeekId === 'all') return rentals;
    
    const week = weeks.find(w => w.id === selectedWeekId);
    if (!week) return rentals;

    return rentals.filter(r => isDateInWeek(r.dateFrom, r.dateTo, week));
  }, [rentals, selectedWeekId, weeks]);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('geoRentals', JSON.stringify(rentals));
  }, [rentals]);

  // --- Handlers ---

  const handleMapClick = (x: number, y: number, width: number, height: number) => {
    setPendingLocation({ x, y, width, height });
    setIsModalOpen(true);
  };

  const handleSaveRental = (data: { tenantName: string; dateFrom: string; dateTo: string; description: string }) => {
    if (!pendingLocation) return;

    // Check collision before saving
    const { collision, conflict } = checkCollision(
      pendingLocation.x,
      pendingLocation.y,
      data.dateFrom,
      data.dateTo,
      rentals,
      pendingLocation.width,
      pendingLocation.height
    );

    if (collision && conflict) {
      alert(`BŁĄD: Kolizja! W tym miejscu istnieje już wynajem w terminie ${conflict.dateFrom} - ${conflict.dateTo} dla najemcy: ${conflict.tenantName}.`);
      return; // Stop saving
    }

    const newRental: Rental = {
      id: uuidv4(),
      x: pendingLocation.x,
      y: pendingLocation.y,
      ...data
    };

    setRentals(prev => [...prev, newRental]);
    setIsModalOpen(false);
    setPendingLocation(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten wynajem?')) {
      setRentals(prev => prev.filter(r => r.id !== id));
    }
  };

  const centerOnPin = (id: string) => {
    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 2500); // Remove highlight after 2.5s
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm z-20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 text-white p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">BORSTL <span className="text-brand-600">2026</span></h1>
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

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        
        {/* Map Section */}
        <section className="bg-white rounded-xl shadow-md p-1 border border-slate-200">
          <div className="bg-slate-50 p-2 border-b border-slate-100 mb-1 rounded-t-lg">
             <p className="text-sm text-slate-500 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               Kliknij na mapę, aby dodać nowy wynajem. Istniejące rezerwacje oznaczono niebieskimi pinami.
             </p>
          </div>
          <div className="aspect-[16/9] w-full bg-slate-100 rounded-lg overflow-hidden">
             <MapBoard 
                rentals={filteredRentals} 
                onMapClick={handleMapClick}
                highlightedRentalId={highlightedId}
             />
          </div>
        </section>

        {/* Table Section */}
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
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                      Brak rezerwacji w wybranym okresie.
                    </td>
                  </tr>
                ) : (
                  filteredRentals.map((rental) => (
                    <tr 
                      key={rental.id} 
                      id={`row-${rental.id}`}
                      onClick={() => centerOnPin(rental.id)}
                      className={`border-b hover:bg-brand-50 cursor-pointer transition-colors ${highlightedId === rental.id ? 'bg-brand-50 ring-2 ring-inset ring-brand-200' : ''}`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">{rental.tenantName}</td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {rental.dateFrom} <span className="text-slate-400 mx-1">→</span> {rental.dateTo}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">{rental.description || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(rental.id); }}
                          className="font-medium text-red-600 hover:text-red-800 hover:underline"
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
      </main>

      {/* Modal for adding rental */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nowa Rezerwacja"
      >
        <RentalForm 
          onSave={handleSaveRental} 
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} BORSTL System. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
};

export default App;
