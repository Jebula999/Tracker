// This file will contain the new correlation analysis logic.

function entryToEventPairs(entry) {
  const pairs = [];
  if (entry.category) pairs.push({ field: 'category', value: entry.category });
  if (entry.subcategory) pairs.push({ field: 'subcategory', value: entry.subcategory });
  if (entry.option) pairs.push({ field: 'option', value: entry.option });
  if (entry.data) {
    for (const key in entry.data) {
      pairs.push({ field: key, value: entry.data[key] });
    }
  }
  return pairs;
}

function getBaselineProbabilities(entries) {
  const eventCounts = {};
  const totalEntries = entries.length;

  for (const entry of entries) {
    const eventPairs = entryToEventPairs(entry);
    for (const pair of eventPairs) {
      const key = JSON.stringify(pair);
      eventCounts[key] = (eventCounts[key] || 0) + 1;
    }
  }

  const probabilities = {};
  for (const key in eventCounts) {
    probabilities[key] = eventCounts[key] / totalEntries;
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

export function runAnalysis(entries, filters = {}) {
  const baselineProbabilities = getBaselineProbabilities(entries);
  const correlations = {};

  const filterKeys = Object.keys(filters);
  const targetEventDescription = filterKeys.map(key => `${key}=${filters[key]}`).join(', ');

  const targetEntries = entries.filter(entry => {
    return filterKeys.every(key => {
      if (key === 'category') return entry.category === filters[key];
      if (key === 'subcategory') return entry.subcategory === filters[key];
      if (key === 'option') return entry.option === filters[key];
      return entry.data && entry.data[key] === filters[key];
    });
  });

  if (targetEntries.length === 0) return {};

  correlations[targetEventDescription] = {};
  const precedingEventCounts = {};
  let targetCount = 0;

  for (const targetEntry of targetEntries) {
    targetCount++;
    const precedingEntries = entries.filter(entry => entry.timestamp < targetEntry.timestamp);

    const seenPrecedingEvents = new Set();
    for (const pEntry of precedingEntries) {
      const pEvents = entryToEventPairs(pEntry);
      for (const pEvent of pEvents) {
        // Don't correlate an event with itself
        if (filterKeys.some(key => key === pEvent.field && filters[key] === pEvent.value)) {
          continue;
        }

        const key = JSON.stringify(pEvent);
        if (!seenPrecedingEvents.has(key)) {
          precedingEventCounts[key] = (precedingEventCounts[key] || 0) + 1;
          seenPrecedingEvents.add(key);
        }
      }
    }
  }

  for (const key in precedingEventCounts) {
    const conditionalProbability = precedingEventCounts[key] / targetCount;
    const baselineProbability = baselineProbabilities[key];
    const likelihood = conditionalProbability / baselineProbability;

    if (likelihood > 1.2 || likelihood < 0.8) {
      correlations[targetEventDescription][key] = {
        conditionalProbability,
        baselineProbability,
        likelihood,
      };
    }
  }

  return correlations;
}
