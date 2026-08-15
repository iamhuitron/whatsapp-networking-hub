import { FileUpload } from "@/components/file-upload/FileUpload";

const checks = [
  "100% gratuito",
  "Sin cuentas",
  "Sin login",
  "Sin servidor",
  "Procesamiento local",
  "Tus datos nunca se suben",
];

const steps = [
  "Exporta tu chat de WhatsApp.",
  "Súbelo aquí.",
  "Selecciona tu nombre.",
  "Encuentra personas.",
  "Haz networking.",
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 py-16">
      <h1 className="text-center text-4xl font-bold tracking-tight text-gray-900">
        WhatsApp Networking Hub
      </h1>
      <p className="mt-4 text-center text-lg text-gray-600">
        Convierte el chat de tu comunidad en un directorio de networking.
      </p>

      <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
        {checks.map((check) => (
          <li key={check} className="flex items-center gap-1.5">
            <span className="text-brand-600">✓</span>
            {check}
          </li>
        ))}
      </ul>

      <div className="mt-10 w-full rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-600">
        🔒 Tu archivo de WhatsApp se procesa completamente en tu navegador.
        No se sube a ningún servidor.
      </div>

      <div className="mt-8 w-full">
        <FileUpload />
      </div>

      <section className="mt-16 w-full">
        <h2 className="text-center text-2xl font-semibold text-gray-900">
          ¿Cómo funciona?
        </h2>
        <ol className="mt-6 space-y-3">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-gray-700">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
