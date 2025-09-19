import React from 'react';

export default function Notification({ message, visible }) {
  return visible ? (
    <div className="notification">
      {message}
    </div>
  ) : null;
}
