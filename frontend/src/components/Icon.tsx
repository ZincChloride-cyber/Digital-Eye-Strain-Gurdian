import React from 'react';

interface IconProps {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ icon, className, style }) => {
  // @ts-ignore
  return <iconify-icon icon={icon} class={className} style={style}></iconify-icon>;
};

export default Icon;
