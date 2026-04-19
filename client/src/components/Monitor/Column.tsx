import React from 'react';

interface CountChip {
  label: string;
  severity: 'critical' | 'orange' | 'warning';
}

interface ColumnProps {
  kind: 'uptime' | 'atera' | 'aruba';
  title: string;
  counts: CountChip[];
  children: React.ReactNode;
}

const Column = ({ kind, title, counts, children }: ColumnProps) => {
  return (
    <div className="col">
      <div className="col-head">
        <div className={`col-title ${kind}`}>
          <span className="dot"></span>
          {title}
        </div>
        <div className="col-counts">
          {counts.map((chip, idx) => (
            <span key={idx} className={`count-chip ${chip.severity}`}>
              {chip.label}
            </span>
          ))}
        </div>
      </div>
      <div className="cards">
        {children}
      </div>
    </div>
  );
};

export default Column;
