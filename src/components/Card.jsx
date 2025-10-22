export default function Card({ title,japaneseTitle,image, children, footer }) {
  return (
    <div className="card">
      {image && (
        <img
          src={image}
          alt={title}
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