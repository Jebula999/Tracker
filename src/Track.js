import React, { useState, useEffect } from 'react';
import { loadEntries } from './localStorageHelpers';
import EntryList from './Components/EntryList';
import CsvExport from './Components/CsvExport';

export default function Track() {
  const [entries, setEntries] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const filtered = entries.filter(e => {
    let ok = true;
    if (filterCategory) {
      ok = ok && (e.category === filterCategory);
    }
    if (filterStartDate) {
        const startDate = new Date(filterStartDate);
        startDate.setHours(0, 0, 0, 0);
        ok = ok && (e.timestamp >= startDate.getTime());
    }
    if (filterEndDate) {
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        ok = ok && (e.timestamp <= endDate.getTime());
    }
    return ok;
  });

  return (
    <div className="track-page">
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by category"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        />
        <input
          type="date"
          placeholder="Start date"
          value={filterStartDate}
          onChange={e => setFilterStartDate(e.target.value)}
        />
        <input
          type="date"
          placeholder="End date"
          value={filterEndDate}
          onChange={e => setFilterEndDate(e.target.value)}
        />
      </div>
      <CsvExport data={filtered} filename="track-export.csv" />
      <EntryList entries={filtered} />
    </div>
  );
}
