import React, { useState, useEffect } from 'react';
import { loadJournal, saveJournal } from './localStorageHelpers';
import CsvExport from './Components/CsvExport';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    setEntries(loadJournal());
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim()) return;
    const entry = { timestamp: Date.now(), text: text.trim() };
    saveJournal(entry);
    setEntries([entry, ...entries]);
    setText("");
  };

  return (
    <div className="journal-page centered-page">
      <form onSubmit={handleSubmit} className="journal-form">
        <textarea
          placeholder="Write your entry here..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          required
        />
        <div className="journal-buttons">
          <button type="submit">Add Entry</button>
          <CsvExport
            data={entries.map(e => ({ timestamp: e.timestamp, text: e.text })) }
            filename="journal-export.csv"
          />
        </div>
      </form>
      <ul className="journal-list">
        {entries.map((e, idx) => (
          <li key={idx}>
            <div>{new Date(e.timestamp).toLocaleString()}</div>
            <div>{e.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
