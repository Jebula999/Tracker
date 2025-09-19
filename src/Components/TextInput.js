import React, { useState } from 'react';

export default function TextInput({ label, onSubmit }) {
  const [value, setValue] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (value.trim() === "") return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="text-input-form">
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        required
      />
      <button type="submit">OK</button>
    </form>
  );
}
