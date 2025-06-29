import React from 'react';

interface FormattedGuidanceTextProps {
  text: string;
  className?: string;
}

export function FormattedGuidanceText({ text, className }: FormattedGuidanceTextProps) {
  if (!text) return null;
  
  const parts = text.split(/(\*.*?\*)/g);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <strong key={index} className="font-semibold text-primary">
              {part.slice(1, -1)}
            </strong>
          );
        }
        return part;
      })}
    </p>
  );
} 