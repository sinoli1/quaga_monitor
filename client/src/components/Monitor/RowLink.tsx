import React from 'react';

interface RowLinkProps {
  href: string;
  statusClass: 'down' | 'orange' | 'warn';
  statusIcon: React.ReactNode;
  title: string;
  titleTag?: string;
  titleTagClass?: string;
  meta: string[];
  duration: string;
  diskBar?: {
    percent: number;
    fillClass: string;
  };
}

const RowLink = ({
  href,
  statusClass,
  statusIcon,
  title,
  titleTag,
  titleTagClass = 'tag-inline',
  meta,
  duration,
  diskBar,
}: RowLinkProps) => {
  return (
    <a className={`row-link ${statusClass}`} href={href} target="_blank" rel="noopener">
      <div className={`row-status ${statusClass}`}>
        {statusIcon}
      </div>
      <div className="row-body">
        <div className="row-title">
          {title}
          {titleTag && <span className={titleTagClass}>{titleTag}</span>}
        </div>
        <div className="row-meta">
          {meta.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="sep"></span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
        {diskBar && (
          <div className="disk-bar">
            <div
              className={`disk-bar-fill ${diskBar.fillClass}`}
              style={{ width: `${diskBar.percent}%` }}
            ></div>
          </div>
        )}
      </div>
      <span className="row-duration">{duration}</span>
      <svg className="row-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </a>
  );
};

export default RowLink;
