import React from 'react';

interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  className = '',
  style,
}) => {
  return (
    <section className={`panel ${className}`} style={style}>
      {title && <h2>&gt; {title}</h2>}
      {children}
    </section>
  );
};
