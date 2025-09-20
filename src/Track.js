import React, { useState, useEffect } from 'react';
import { loadEntries, deleteTrackEntry, deleteFilteredTrackEntries } from './localStorageHelpers';
import EntryList from './Components/EntryList';
import CsvExport from './Components/CsvExport';

export default function Track() {
  const [entries, setEntries] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const allCategories = [...new Set(entries.map(e => e.category))];

  const filtered = entries.filter(e => {
    let ok = true;
    if (selectedCategories.length > 0) {
      ok = ok && selectedCategories.includes(e.category);
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

  const handleCategoryChange = (category) => {
    const newSelected = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newSelected);
  };

  const handleDelete = timestamp => {
    deleteTrackEntry(timestamp);
    setEntries(entries.filter(entry => entry.timestamp !== timestamp));
  };

  const handleDeleteFiltered = () => {
    const timestamps = filtered.map(entry => entry.timestamp);
    deleteFilteredTrackEntries(timestamps);
    setEntries(entries.filter(entry => !timestamps.includes(entry.timestamp)));
  };

  return (
    <div className="track-page">
      <div className="filters">
        <div className="multi-select">
          <button onClick={() => setShowCategories(!showCategories)}>
            {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : "Select Categories"}
          </button>
          {showCategories && (
            <div className="multi-select-options">
              {allCategories.map(c => (
                <label key={c}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c)}
                    onChange={() => handleCategoryChange(c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          )}
        </div>
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
      <div className="track-actions">
        <CsvExport data={filtered} filename="track-export.csv" />
        <button onClick={handleDeleteFiltered}>Delete Filtered</button>
      </div>
      <EntryList entries={filtered} onDelete={handleDelete} />
    </div>
  );
}
