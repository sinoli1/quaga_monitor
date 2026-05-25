import React from 'react';

interface ActiveIspsProps {
  count: number;
  list: string[];
}

const ActiveIsps = ({ count, list }: ActiveIspsProps) => (
  <div className="active-isps flex items-center gap-2 flex-wrap text-xs pt-1">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#5fd39f]">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <span className="shrink-0 text-[#5fd39f]"><strong>{count} ISPs activos</strong></span>
    <div className="flex gap-1.5 flex-wrap ml-1">
      {list.map((isp, idx) => (
        <span key={idx} className="text-[10px] font-semibold tracking-wider bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-md uppercase">
          {isp}
        </span>
      ))}
    </div>
  </div>
);

export default ActiveIsps;
