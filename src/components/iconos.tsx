// Íconos de trazo, en SVG, sin librerías.

type Props = { size?: number; className?: string };

function Trazo({ size = 20, className, children, grosor = 2 }: Props & { children: React.ReactNode; grosor?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconoWifi = (p: Props) => (
  <Trazo {...p}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <path d="M12 20h.01" />
  </Trazo>
);

export const IconoFlechaAbajo = (p: Props) => (
  <Trazo {...p}>
    <path d="M12 5v14" />
    <path d="M5 12l7 7 7-7" />
  </Trazo>
);

export const IconoFlechaDerecha = (p: Props) => (
  <Trazo {...p}>
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </Trazo>
);

export const IconoFlechaIzquierda = (p: Props) => (
  <Trazo {...p}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </Trazo>
);

export const IconoCopiar = (p: Props) => (
  <Trazo {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Trazo>
);

export const IconoCheck = (p: Props) => (
  <Trazo {...p} grosor={2.4}>
    <path d="M20 6L9 17l-5-5" />
  </Trazo>
);

export const IconoMas = (p: Props) => (
  <Trazo {...p} grosor={2.4}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Trazo>
);

export const IconoMenos = (p: Props) => (
  <Trazo {...p} grosor={2.4}>
    <path d="M5 12h14" />
  </Trazo>
);

export const IconoBolsa = (p: Props) => (
  <Trazo {...p}>
    <path d="M6 8h12l-1 12H7L6 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Trazo>
);

export const IconoBasura = (p: Props) => (
  <Trazo {...p}>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 13h10l1-13" />
    <path d="M9 7V4h6v3" />
  </Trazo>
);

export const LogoGoogle = ({ size = 20, className }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
