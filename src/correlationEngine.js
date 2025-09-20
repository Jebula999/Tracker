// This file will contain the new correlation analysis logic.

function formatEvent(entry) {
  let eventString = `${entry.category}`;
  if (entry.subcategory) {
    eventString += `-${entry.subcategory}`;
  }
  if (entry.option) {
    eventString += `-${entry.option}`;
  }
  if (entry.data) {
    for (const key in entry.data) {
      eventString += `-${key}:${entry.data[key]}`;
    }
  }
  return eventString;
}

function getUniqueEvents(entries) {
  const events = entries.map(formatEvent);
  return [...new Set(events)];
}

function getBaselineProbabilities(entries, uniqueEvents) {
  const probabilities = {};
  const totalEntries = entries.length;

  for (const event of uniqueEvents) {
    const count = entries.filter(entry => formatEvent(entry) === event).length;
    probabilities[event] = count / totalEntries;
  }

  return probabilities;
}

function areOnSameDay(ts1, ts2) {
  const date1 = new Date(ts1);
  const date2 = new Date(ts2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function runAnalysis(entries, window = 'same day') {
  const uniqueEvents = getUniqueEvents(entries);
  const baselineProbabilities = getBaselineProbabilities(entries, uniqueEvents);
  const correlations = {};

  for (const targetEvent of uniqueEvents) {
    correlations[targetEvent] = {};
    const targetEntries = entries.filter(entry => formatEvent(entry) === targetEvent);

    for (const precedingEvent of uniqueEvents) {
      if (targetEvent === precedingEvent) continue;

      let count = 0;
      let targetCount = 0;

      for (const targetEntry of targetEntries) {
        targetCount++;
        const precedingEntries = entries.filter((entry, index) => {
          if (window === 'same day') {
            return areOnSameDay(entry.timestamp, targetEntry.timestamp) && entry.timestamp < targetEntry.timestamp;
          }
          if (window === 'last 3 entries') {
            const targetIndex = entries.findIndex(e => e.timestamp === targetEntry.timestamp);
            return index < targetIndex && index >= targetIndex - 3;
          }
          if (window === 'last 6 hours') {
            return entry.timestamp < targetEntry.timestamp && entry.timestamp >= targetEntry.timestamp - 6 * 60 * 60 * 1000;
          }
          return false;
        });

        if (precedingEntries.some(entry => formatEvent(entry) === precedingEvent)) {
          count++;
        }
      }

      if (targetCount > 0) {
        const conditionalProbability = count / targetCount;
        const baselineProbability = baselineProbabilities[precedingEvent];
        const likelihood = conditionalProbability / baselineProbability;

        if (likelihood > 1.2 || likelihood < 0.8) { // Only show significant correlations
          correlations[targetEvent][precedingEvent] = {
            conditionalProbability,
            baselineProbability,
            likelihood,
          };
        }
      }
    }
  }

  return correlations;
}
