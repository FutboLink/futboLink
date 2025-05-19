import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Casos de Éxito | FutboLink',
  description: 'Historias de éxito de jugadores y profesionales que han utilizado FutboLink para avanzar en sus carreras futbolísticas.',
}

export default function SuccessCasesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
} 