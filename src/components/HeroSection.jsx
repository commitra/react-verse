export default function HeroSection({ image, title, subtitle }) {
  return (
    <div className="relative overflow-hidden rounded-xl mb-6 bg-gradient-to-r from-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-10 flex items-center gap-6">
        {image ? (
          <img
            src={image}
            alt=""
            className="w-24 h-24 object-cover rounded-lg shadow-md hidden sm:block"
          />
        ) : null}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
