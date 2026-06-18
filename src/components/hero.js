export default function Hero() {

  return (

    <section
      className="
        h-screen
        bg-cover
        bg-center
        flex
        items-center
        justify-center
      "
      style={{
        backgroundImage: "url('/banner.jpg')",
      }}
    >

      <div className="bg-black/60 p-10 rounded-xl text-white text-center">

        <h1 className="text-5xl font-bold mb-6">
          Aqui seus dentes irão abalar corações
        </h1>

        <p className="text-xl mb-6">
          Sistema de Clinica Odontologica MG
        </p>

        <button
          className="
            bg-orange-500
            hover:bg-orange-600
            px-8
            py-3
            rounded-lg
          "
        >
          Saiba Mais
        </button>

      </div>

    </section>

  );

}