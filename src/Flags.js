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

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    // When a filter changes, remove subsequent filters
    const filterNames = ['category', 'subcategory', 'option', 'duration', 'hadDream', 'dreamType', 'amount'];
    const currentIndex = filterNames.indexOf(filterName);
    for (let i = currentIndex + 1; i < filterNames.length; i++) {
      delete newFilters[filterNames[i]];
    }
    setFilters(newFilters);
  };

  const renderFilterDropdowns = () => {
    const dropdowns = [];
    const filterNames = ['category', 'subcategory', 'option', 'duration', 'hadDream', 'dreamType', 'amount'];
    let currentSchemaLevel = trackerData;
    let path = [];

    for (let i = 0; i < filterNames.length; i++) {
      const filterName = filterNames[i];
      const filterValue = filters[filterName];
      const options = Object.keys(currentSchemaLevel);

      if (options.length === 0) break;

      // Special handling for 'options' which is a direct array
      if (currentSchemaLevel.options && Array.isArray(currentSchemaLevel.options)) {
        dropdowns.push(
          <select
            key={filterName}
            value={filterValue || ''}
            onChange={e => handleFilterChange(filterName, e.target.value)}
          >
            <option value="">Select {filterName}</option>
            {currentSchemaLevel.options.map(opt => {
              const label = typeof opt === 'string' ? opt : opt.label;
              return <option key={label} value={label}>{label}</option>;
            })}
          </select>
        );
        break; // Stop after the 'options' array
      }

      if (options.includes('options') && !filterValue) {
        // if there is an options property, we should probably be selecting from that.
         dropdowns.push(
          <select
            key={filterName}
            value={filterValue || ''}
            onChange={e => handleFilterChange(filterName, e.target.value)}
          >
            <option value="">Select {filterName}</option>
            {currentSchemaLevel.options.map(opt => {
              const label = typeof opt === 'string' ? opt : opt.label;
              return <option key={label} value={label}>{label}</option>;
            })}
          </select>
        );
        break;
      }


      dropdowns.push(
        <select
          key={filterName}
          value={filterValue || ''}
          onChange={e => handleFilterChange(filterName, e.target.value)}
        >
          <option value="">Select {filterName}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );

      if (!filterValue) break;

      path.push(filterValue);
      currentSchemaLevel = currentSchemaLevel[filterValue];
      if (currentSchemaLevel && currentSchemaLevel.next) {
        currentSchemaLevel = currentSchemaLevel.next;
      }

       if (!currentSchemaLevel) break;

      // If the next level is another filter value (e.g. "Normal" or "Real" for HadDream),
      // we need to find the right path.
      if (filters[filterNames[i+1]] && currentSchemaLevel[filters[filterNames[i+1]]]) {
          currentSchemaLevel = currentSchemaLevel[filters[filterNames[i+1]]];
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
        {renderFilterDropdowns()}
        <button onClick={() => setFilters({})} className="button-style">Reset</button>
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
