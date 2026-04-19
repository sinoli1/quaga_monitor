import React from 'react';

interface ActiveIspsProps {
  count: number;
  list: string;
}

const ActiveIsps = ({ count, list }: ActiveIspsProps) => (
  <div className="active-isps">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <span><strong>{count} ISPs activos</strong> · {list}</span>
  </div>
);

export default ActiveIsps;
