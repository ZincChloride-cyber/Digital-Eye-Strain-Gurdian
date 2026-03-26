import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { icon?: string; style?: React.CSSProperties }, HTMLElement>;
    }
  }
}
