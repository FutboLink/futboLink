const LatestOffersCarousel = () => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-12">

          <span className="inline-flex items-center rounded-full bg-green-100 text-[#1d5126] px-4 py-1 text-sm font-semibold">
            NUEVO
          </span>

          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Últimas oportunidades
          </h2>

          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Descubrí las ofertas más recientes publicadas por clubes y agencias de todo el mundo.
          </p>

        </div>

        <div className="h-72 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center">
          <p className="text-gray-400 text-lg">
            Aquí aparecerán las últimas ofertas
          </p>
        </div>

      </div>
    </section>
  );
};

export default LatestOffersCarousel;
