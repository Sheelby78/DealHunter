import React from 'react';

interface GlitchTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'span';
  className?: string;
  style?: React.CSSProperties;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  as: Component = 'h1',
  className = '',
  style,
}) => {
  return (
    <Component
      className={`glitch ${className}`}
      data-text={text}
      style={{ margin: 0, ...style }}
    >
      {text}
    </Component>
  );
};
