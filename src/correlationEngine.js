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

function getUniqueEvents(entries) {
  const uniqueEvents = new Map();
  entries.forEach(entry => {
    const eventKey = JSON.stringify(entryToEventPairs(entry));
    if (!uniqueEvents.has(eventKey)) {
      uniqueEvents.set(eventKey, entry);
    }
  });
  return Array.from(uniqueEvents.values());
}

export function runAnalysis(entries, filters = {}) {
  const baselineProbabilities = getBaselineProbabilities(entries);
  const correlations = {};
  const filterKeys = Object.keys(filters);

  let sourceEntries = entries;
  if (filterKeys.length > 0) {
    sourceEntries = entries.filter(entry => {
      return filterKeys.every(key => {
        if (key === 'category' && entry.category !== filters[key]) return false;
        if (key === 'subcategory' && entry.subcategory !== filters[key]) return false;
        if (key === 'option' && entry.option !== filters[key]) return false;
        return true;
      });
    });
  }

  const uniqueEventsToAnalyze = getUniqueEvents(sourceEntries);

  for (const uniqueEvent of uniqueEventsToAnalyze) {
    const targetEventPairs = entryToEventPairs(uniqueEvent);
    const targetEventKey = JSON.stringify(targetEventPairs);
    const targetEventDescription = targetEventPairs.map(p => `${p.field}: ${p.value}`).join(', ');

    const allInstancesOfTarget = entries.filter(e => JSON.stringify(entryToEventPairs(e)) === targetEventKey);
    if (allInstancesOfTarget.length === 0) continue;

    const precedingEventCounts = {};
    for (const instance of allInstancesOfTarget) {
      const precedingEntries = entries.filter(p => p.timestamp < instance.timestamp);
      const seenInThisInstance = new Set();
      for (const pEntry of precedingEntries) {
        const pEventPairs = entryToEventPairs(pEntry);
        // Don't correlate an event with its own individual parts
        if (JSON.stringify(pEventPairs) === targetEventKey) continue;

        for (const pPair of pEventPairs) {
            const pPairKey = JSON.stringify(pPair);
            if (!seenInThisInstance.has(pPairKey)) {
                precedingEventCounts[pPairKey] = (precedingEventCounts[pPairKey] || 0) + 1;
                seenInThisInstance.add(pPairKey);
            }
        }
      }
    }

    if (Object.keys(precedingEventCounts).length > 0) {
        correlations[targetEventDescription] = {};
        for (const pKey in precedingEventCounts) {
            const conditionalProbability = precedingEventCounts[pKey] / allInstancesOfTarget.length;
            const baselineProbability = baselineProbabilities[pKey];
            if (baselineProbability > 0) {
                const likelihood = conditionalProbability / baselineProbability;
                if (likelihood > 1.2 || likelihood < 0.8) {
                    correlations[targetEventDescription][pKey] = { conditionalProbability, baselineProbability, likelihood };
                }
            }
        }
    }
  }

  return correlations;
}
