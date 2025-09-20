import React from 'react';

function convertEntriesToCSV(entries) {
  if (!entries || entries.length === 0) return "";

  const dataKeysSet = new Set();
  entries.forEach(e => {
    if (e.data && typeof e.data === 'object') {
      Object.keys(e.data).forEach(k => dataKeysSet.add(k));
    }
  });
  const dataKeys = Array.from(dataKeysSet);

  const headers = ["timestamp","category","subcategory","option", ...dataKeys];

  const lines = entries.map(e => {
    const row = [];
    row.push(e.timestamp);
    row.push(e.category);
    row.push(e.subcategory || "");
    row.push(e.option || "");
    dataKeys.forEach(k => {
      const v = e.data && e.data[k] != null ? e.data[k] : "";
      const clean = ("" + v).replace(/"/g, '""');
      row.push(`"${clean}"`);
    });
    return row.join(",");
  });

  return [headers.join(","), ...lines].join("\r\n");
}

function convertAnalysisToCSV(analysis) {
  if (!analysis) return "";

  const headers = ["Target Event", "Preceding Event", "Likelihood", "Conditional Probability"];
  const lines = [];

  for (const targetEvent in analysis) {
    for (const precedingEvent in analysis[targetEvent]) {
      const data = analysis[targetEvent][precedingEvent];
      const row = [
        `"${targetEvent}"`,
        `"${precedingEvent}"`,
        data.likelihood.toFixed(2),
        (data.conditionalProbability * 100).toFixed(0) + "%",
      ];
      lines.push(row.join(","));
    }
  }

  return [headers.join(","), ...lines].join("\r\n");
}

export default function CsvExport({ data, filename = "export.csv", isAnalysis = false }) {
  const handleClick = () => {
    const csvString = isAnalysis ? convertAnalysisToCSV(data) : convertEntriesToCSV(data);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute("download", filename);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleClick} className="button-style">Export CSV</button>
  );
}
