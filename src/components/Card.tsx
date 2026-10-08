import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  japaneseTitle?: ReactNode;
  image?: string;
  children?: ReactNode;
  footer?: ReactNode;
  style?: CSSProperties;
  size?: string;
}

export default function Card({ title, japaneseTitle, image, children, footer, style }: CardProps) {
  return (
    <div className="card" style={style}>
      {image && (
        <img
          src={image}
          alt={typeof title === 'string' ? title : ''}
          className="w-full h-64 object-cover"
        />
      )}
      {title && <h3>{title}</h3>}
         {japaneseTitle && <p className="text-sm italic text-gray-500 dark:text-gray-300">{japaneseTitle}</p>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

