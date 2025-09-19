import React from 'react';

export default function EntryList({ entries }) {
  return (
    <ul className="entry-list">
      {entries.map((e, idx) => (
        <li key={idx}>
          <div><strong>{e.category}</strong> — {new Date(e.timestamp).toLocaleString()}</div>
          {e.subcategory && <div><em>Type:</em> {e.subcategory}</div>}
          {e.option && <div><em>Option:</em> {e.option}</div>}
          {e.data && (
            <div className="entry-data">
              {Object.keys(e.data).map((key) => (
                <div key={key}>
                  <span>{key}:</span> <span>{e.data[key]}</span>
                </div>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
