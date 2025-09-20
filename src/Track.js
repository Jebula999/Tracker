import React, { useState, useEffect, useRef } from 'react';
import { loadEntries, deleteTrackEntry, deleteFilteredTrackEntries } from './localStorageHelpers';
import EntryList from './Components/EntryList';
import CsvExport from './Components/CsvExport';

export default function Track() {
  const [entries, setEntries] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const categorySelectRef = useRef(null);

  useEffect(() => {
    setEntries(loadEntries().sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (categorySelectRef.current && !categorySelectRef.current.contains(event.target)) {
        setShowCategories(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [categorySelectRef]);

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

  const resetFilters = () => {
    setSelectedCategories([]);
    setFilterStartDate("");
    setFilterEndDate("");
  };

  return (
    <div className="track-page">
      <div className="filters">
        <div className="multi-select" ref={categorySelectRef}>
          <button onClick={() => setShowCategories(!showCategories)} className="csv-export-button">
            {selectedCategories.length > 0 ? `${selectedCategories.length} cat selected` : "Select Categories"}
          </button>
          {showCategories && (
            <div className="multi-select-options">
              {allCategories.map(category => (
                <label key={category}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  {category}
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
        <button onClick={resetFilters}>Reset</button>
      </div>
      <div className="track-actions">
        <CsvExport data={filtered} filename="track-export.csv" />
        <button onClick={handleDeleteFiltered} className="csv-export-button">Delete Filtered</button>
      </div>
      <EntryList entries={filtered} onDelete={handleDelete} />
    </div>
  );
}
