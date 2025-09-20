import React, { useState } from 'react';
import { loadEntries } from './localStorageHelpers';
import CsvExport from './Components/CsvExport';

export default function Flags() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [filteredEntries, setFilteredEntries] = useState([]);

  const handleAnalyse = () => {
    const entries = loadEntries();
    let filtered = entries;

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(e => e.timestamp >= start.getTime());
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(e => e.timestamp <= end.getTime());
    }

    setFilteredEntries(filtered);

    // Simple correlation: for each event type, find the most common preceding events
    const correlations = {};
    const allEventTypes = [...new Set(entries.map(e => e.category))];

    for (const type of allEventTypes) {
      correlations[type] = {};
      const eventsOfType = filtered.filter(e => e.category === type);
      if (eventsOfType.length === 0) continue;

      for (const event of eventsOfType) {
        // Look for events in the 24 hours prior
        const preceding = filtered.filter(p =>
          p.timestamp < event.timestamp &&
          p.timestamp >= (event.timestamp - 24 * 60 * 60 * 1000)
        );
        for (const p of preceding) {
          const pKey = p.subcategory ? `${p.category} - ${p.subcategory}` : p.category;
          correlations[type][pKey] = (correlations[type][pKey] || 0) + 1;
        }
      }
    }
    setAnalysis(correlations);
  };

  return (
    <div className="flags-page">
      <h2>Flags Analysis</h2>
      <p>This page is for analyzing trends and correlations in your tracking history.</p>
      <div className="filters">
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
        <button onClick={handleAnalyse} className="button-style">Analyse</button>
        <CsvExport data={filteredEntries} filename="flags-export.csv" />
      </div>

      {analysis && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          {Object.entries(analysis).map(([type, precedingEvents]) => (
            <div key={type} className="correlation-group">
              <h4>When you experienced: <strong>{type}</strong></h4>
              <p>It was most often preceded by:</p>
              <ul>
                {Object.entries(precedingEvents)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5) // Show top 5
                  .map(([p, count]) => (
                    <li key={p}>{p} ({count} times)</li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
