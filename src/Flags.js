import React, { useState } from 'react';
import { loadEntries } from './localStorageHelpers';
import CsvExport from './Components/CsvExport';
import { runAnalysis } from './correlationEngine';
import { trackerData } from './dataSchema';

export default function Flags() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [filters, setFilters] = useState({});

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFilters(category ? { category } : {});
  };

  const handleSubItemChange = (e) => {
    const subItem = e.target.value;
    const categorySchema = trackerData[filters.category];
    const key = categorySchema.options ? 'option' : 'subcategory';
    setFilters({ ...filters, [key]: subItem });
  };

  const renderSimpleDropdowns = () => {
    const dropdowns = [];

    dropdowns.push(
      <select key="category" value={filters.category || ''} onChange={handleCategoryChange}>
        <option value="">Select Category</option>
        {Object.keys(trackerData).map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    );

    if (filters.category) {
      const categorySchema = trackerData[filters.category];
      if (categorySchema) {
        const subItemOptions = categorySchema.options
          ? categorySchema.options.map(o => typeof o === 'string' ? o : o.label)
          : Object.keys(categorySchema);

        const subItemKey = categorySchema.options ? 'option' : 'subcategory';

        dropdowns.push(
          <select key="subitem" value={filters[subItemKey] || ''} onChange={handleSubItemChange}>
            <option value="">Select Sub-item</option>
            {subItemOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      }
    }
    return dropdowns;
  };

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

    const analysisResults = runAnalysis(filtered, filters);
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
      </div>
      <div className="track-actions">
        <button onClick={handleAnalyse} className="button-style">Analyse</button>
        <CsvExport data={analysis} filename="flags-export.csv" isAnalysis={true} />
      </div>

      <div className="correlation-filters">
        {renderSimpleDropdowns()}
        <button onClick={() => setFilters({})} className="button-style" style={{ minWidth: 'auto', padding: '10px 20px' }}>Reset</button>
      </div>

      {analysis && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          {Object.entries(analysis).map(([targetEvent, precedingEvents]) => {
            const precedingEventEntries = Object.entries(precedingEvents);
            if (precedingEventEntries.length === 0) return null;

            return (
              <div key={targetEvent} className="correlation-group">
                <h4>When: <strong>{targetEvent}</strong></h4>
                <p>It was most often preceded by:</p>
                <ul>
                  {precedingEventEntries
                    .sort(([, a], [, b]) => b.likelihood - a.likelihood)
                    .map(([precedingEvent, data]) => {
                      const preceding = JSON.parse(precedingEvent);
                      return (
                        <li key={precedingEvent}>
                          <strong>{preceding.field}:</strong> {preceding.value} (
                          {data.likelihood > 1 ? 'more' : 'less'} likely,{' '}
                          {(data.conditionalProbability * 100).toFixed(0)}% of the time)
                        </li>
                      );
                    })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
