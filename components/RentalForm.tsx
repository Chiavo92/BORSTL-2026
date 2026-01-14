import React, { useState } from 'react';
import { Button } from './Button';

interface RentalFormProps {
  initialDateFrom?: string;
  initialDateTo?: string;
  onSave: (data: { tenantName: string; dateFrom: string; dateTo: string; description: string }) => void;
  onCancel: () => void;
}

export const RentalForm: React.FC<RentalFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    tenantName: '',
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    description: ''
  });

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

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Anuluj</Button>
        <Button type="submit" variant="primary">Zapisz Rezerwację</Button>
      </div>
    </form>
  );
};
