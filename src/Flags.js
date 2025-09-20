import React, { useState, useEffect } from 'react';
import { loadEntries } from './localStorageHelpers';

export default function Flags() {
  const [entries, setEntries] = useState([]);
  const [flags, setFlags] = useState([]);

  useEffect(() => {
    const data = loadEntries();
    setEntries(data);
    computeFlags(data);
  }, []);

  const computeFlags = (data) => {
    const newFlags = [];

    data.forEach((e) => {
      if (e.category === "Mood" && (e.option === "Low" || e.option === "Irritable")) {
        const date = new Date(e.timestamp);
        data.forEach((f) => {
          if (f.category === "Food" && f.timestamp < e.timestamp) {
            const dateF = new Date(f.timestamp);
            if (
              dateF.getFullYear() === date.getFullYear() &&
              dateF.getMonth() === date.getMonth() &&
              dateF.getDate() === date.getDate()
            ) {
              newFlags.push(`Mood ${e.option} after eating ${f.option || f.subcategory || f.category}`);
            }
          }
        });
      }
    });

    setFlags(newFlags);
  };

  if (flags.length === 0) {
    return <div className="flags-page">No flags detected.</div>;
  }

  return (
    <div className="flags-page">
      <ul>
        {flags.map((f, idx) => <li key={idx}>{f}</li>)}
      </ul>
    </div>
  );
}
