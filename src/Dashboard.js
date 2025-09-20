import React from 'react';
import * as Icons from 'react-feather';
import { trackerData } from './dataSchema';
import CategoryButton from './Components/CategoryButton';

export default function Dashboard({ navigateTo }) {
  const iconMap = {
    Food: Icons.Coffee,
    Sleep: Icons.Moon,
    Mood: Icons.Smile,
    Energy: Icons.Battery,
    Activity: Icons.Activity,
    Symptoms: Icons.AlertCircle,
    HeartHealth: Icons.Heart,
    Intimacy: Icons.Users
  };

  const handleCategoryClick = (categoryKey) => {
    if (categoryKey === "Sleep") {
      navigateTo("SelectSleepType", { parentTab: 'Dashboard' });
    } else {
      navigateTo("SelectOption", { categoryKey, parentTab: 'Dashboard' });
    }
  };

  return (
    <div className="dashboard">
      {Object.keys(trackerData).map((cat, idx) => {
        const Icon = iconMap[cat] || null;
        return (
          <CategoryButton
            key={idx}
            label={cat}
            icon={Icon}
            onClick={() => handleCategoryClick(cat)}
          />
        );
      })}
    </div>
  );
}
