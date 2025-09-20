import React, { useState } from 'react';
import { loadEntries } from './localStorageHelpers';
import CsvExport from './Components/CsvExport';
import { runAnalysis } from './correlationEngine';

export default function Flags() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [window, setWindow] = useState('same day');

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

    const analysisResults = runAnalysis(filtered, window);
    setAnalysis(analysisResults);
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
        <select value={window} onChange={e => setWindow(e.target.value)}>
          <option value="same day">Same Day</option>
          <option value="last 3 entries">Last 3 Entries</option>
          <option value="last 6 hours">Last 6 Hours</option>
        </select>
      </div>
      <div className="track-actions">
        <button onClick={handleAnalyse} className="button-style">Analyse</button>
        <CsvExport data={analysis} filename="flags-export.csv" isAnalysis={true} />
      </div>

      {analysis && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          {Object.entries(analysis).map(([targetEvent, precedingEvents]) => {
            const precedingEventEntries = Object.entries(precedingEvents);
            if (precedingEventEntries.length === 0) return null;

            return (
              <div key={targetEvent} className="correlation-group">
                <h4>When you experienced: <strong>{targetEvent}</strong></h4>
                <p>It was most often preceded by:</p>
                <ul>
                  {precedingEventEntries
                    .sort(([, a], [, b]) => b.likelihood - a.likelihood)
                    .map(([precedingEvent, data]) => (
                      <li key={precedingEvent}>
                        {precedingEvent} (
                        {data.likelihood > 1 ? 'more' : 'less'} likely,{' '}
                        {(data.conditionalProbability * 100).toFixed(0)}% of the time)
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
