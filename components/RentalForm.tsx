import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Rental } from '../types';

interface RentalFormProps {
  initialData?: Rental; // Optional rental data for editing
  onSave: (data: { tenantName: string; dateFrom: string; dateTo: string; description: string }) => void;
  onDelete?: () => void; // Optional delete handler
  onCancel: () => void;
}

export const RentalForm: React.FC<RentalFormProps> = ({ initialData, onSave, onDelete, onCancel }) => {
  const [formData, setFormData] = useState({
    tenantName: '',
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    description: ''
  });

  // Populate form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        tenantName: initialData.tenantName,
        dateFrom: initialData.dateFrom,
        dateTo: initialData.dateTo,
        description: initialData.description
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.dateFrom) > new Date(formData.dateTo)) {
      alert("Data 'Od' nie może być późniejsza niż data 'Do'");
      return;
    }
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa Najemcy</label>
        <input
          required
          type="text"
          name="tenantName"
          value={formData.tenantName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
          placeholder="np. Jan Kowalski"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data Od</label>
          <input
            required
            type="date"
            name="dateFrom"
            value={formData.dateFrom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data Do</label>
          <input
            required
            type="date"
            name="dateTo"
            value={formData.dateTo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Opis (opcjonalnie)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
          placeholder="Uwagi dot. rezerwacji..."
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
        <div>
          {initialData && onDelete && (
            <Button type="button" variant="danger" onClick={onDelete}>Usuń</Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>Anuluj</Button>
          <Button type="submit" variant="primary">
              {initialData ? 'Zapisz Zmiany' : 'Utwórz Rezerwację'}
          </Button>
        </div>
      </div>
    </form>
  );
};
