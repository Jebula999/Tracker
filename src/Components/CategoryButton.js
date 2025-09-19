import React from 'react';

export default function CategoryButton({ label, icon: Icon, onClick }) {
  return (
    <button className="category-button" onClick={onClick}>
      {Icon && <Icon className="category-icon" />}
      <span>{label}</span>
    </button>
  );
}
