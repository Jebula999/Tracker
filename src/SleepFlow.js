import React, { useState } from 'react';
import { saveEntry } from './localStorageHelpers';
import { trackerData } from './dataSchema';

export default function SleepFlow({ onDone, sleepType, showNotif }) {
  const [step, setStep] = useState("Duration");
  const [collected, setCollected] = useState({});

  const typeKey = sleepType === "Last Night" ? "LastNight" : "Nap";
  const schema = trackerData.Sleep[typeKey];

  const handlePick = (field, value) => {
    const nextCollected = { ...collected, [field]: value };
    setCollected(nextCollected);
    if (field === "Duration") {
      setStep("HadDream");
    } else if (field === "HadDream") {
      if (value === "None") {
        finish(nextCollected);
      } else {
        setStep("DreamType");
      }
    } else if (field === "DreamType") {
      setStep("Amount");
    } else if (field === "Amount") {
      finish(nextCollected);
    }
  };

  const finish = (finalData) => {
    const entry = {
      timestamp: Date.now(),
      category: "Sleep",
      subcategory: typeKey,
      data: finalData
    };
    saveEntry(entry);
    showNotif("Success");
    onDone();
  };

  const getOptions = () => {
    if (step === "Duration") {
      return schema.Duration.options;
    }
    if (step === "HadDream") {
      return schema.Duration.next.HadDream.options;
    }
    if (step === "DreamType") {
      const had = collected.HadDream;
      return schema.Duration.next.HadDream.next[had].DreamType.options;
    }
    if (step === "Amount") {
      const had = collected.HadDream;
      return schema.Duration.next.HadDream.next[had].DreamType.next.Amount.options;
    }
    return [];
  };

  return (
    <div className="sleep-flow">
      <h2>Sleep – {sleepType} – {step}</h2>
      <ul>
        {getOptions().map((opt, idx) => {
          if (typeof opt === "object" && opt.input === "text") {
            return (
              <li key={idx}>
                <button onClick={() => {
                  const val = window.prompt("Enter text:");
                  if (val) handlePick(step, val);
                }}>
                  {opt.label}
                </button>
              </li>
            );
          } else {
            return (
              <li key={idx}>
                <button onClick={() => handlePick(step, opt)}>
                  {opt}
                </button>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
}
