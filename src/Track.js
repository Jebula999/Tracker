import React, { useState, useEffect } from 'react';
import { loadEntries } from './localStorageHelpers';
import EntryList from './Components/EntryList';
import CsvExport from './Components/CsvExport';

export default function Track() {
  const [entries, setEntries] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const filtered = entries.filter(e => {
    let ok = true;
    if (filterCategory) {
      ok = ok && (e.category === filterCategory);
    }
    if (filterDate) {
      const d = new Date(e.timestamp);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth()+1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      if (`${yyyy}-${mm}-${dd}` !== filterDate) ok = false;
    }
    return ok;
  });

  return (
    <div className="track-page">
      <div className="filters">
        <input
          type="text"
          placeholder="Category"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        />
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
      </div>
      <CsvExport data={filtered} filename="track-export.csv" />
      <EntryList entries={filtered} />
    </div>
  );
}
