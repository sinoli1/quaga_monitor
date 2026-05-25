import React, { useState } from 'react';

interface ShowMoreProps {
  count: number;
  label?: string;
  children?: React.ReactNode;
}

const ShowMore = ({ count, label = 'dispositivos más caídos', children }: ShowMoreProps) => {
  const [expanded, setExpanded] = useState(false);

  if (expanded && children) {
    return <>{children}</>;
  }

  return (
    <div className="show-more" onClick={() => setExpanded(true)}>
      + {count} {label}
    </div>
  );
};

export default ShowMore;
