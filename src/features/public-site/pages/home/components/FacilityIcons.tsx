function MaternityCareIcon({ className }: { className?: string }) {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      {/* Head of expectant mother */}
      <circle cx='11.5' cy='4.5' r='2.25' />
      {/* Mother's back line curving gently */}
      <path d='M9 8C8 9.8 7.5 12 7.5 14.5C7.5 17.8 8.5 19.8 10 22' />
      {/* Neck and chest line */}
      <path d='M12 7.2C12.8 8.2 13.2 9.2 13.2 10.2' />
      {/* Pregnant baby bump (perut ibu hamil) */}
      <path d='M13.2 10.2C16.2 11.8 17.2 14.5 16 17C14.8 19.5 12.8 20.8 10 22' />
      {/* Mother's hand tenderly resting on baby bump */}
      <path d='M10.5 10.8C11.2 12.2 12.2 13.8 14 14.8' />
      {/* Maternal love heart accent */}
      <path
        d='M18 3.5C17.2 2.7 16 2.8 15.3 3.6C14.6 2.8 13.4 2.7 12.6 3.5C11.7 4.5 13.3 6.1 15.3 7.5C17.3 6.1 18.9 4.5 18 3.5Z'
        fill='currentColor'
        fillOpacity='0.2'
        strokeWidth='1.4'
      />
    </svg>
  );
}

function LaserPediatricIcon({ className }: { className?: string }) {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      {/* Cheerful child head */}
      <circle cx='12' cy='7' r='3.5' />
      {/* Playful hair tuft */}
      <path d='M11 3.5C11.5 2 13.5 2 13 3.8' strokeWidth='1.6' />
      {/* Cheerful smile */}
      <path d='M10.5 8C11.2 9 12.8 9 13.5 8' strokeWidth='1.6' />
      {/* Happy waving arms */}
      <path d='M8 12.5L5 9.5M16 12.5L19 9.5' />
      {/* Child torso */}
      <path d='M8 12.5C8 11.2 9.5 10.5 12 10.5C14.5 10.5 16 11.2 16 12.5V17H8V12.5Z' />
      {/* Legs */}
      <path d='M9.8 17V21.5M14.2 17V21.5' />
    </svg>
  );
}

function Emergency24hIcon({ className }: { className?: string }) {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      {/* Continuous 24h circular track with arrow */}
      <path d='M12 2.5C17.2 2.5 21.5 6.8 21.5 12C21.5 17.2 17.2 21.5 12 21.5C6.8 21.5 2.5 17.2 2.5 12C2.5 9 3.8 6.4 6 4.6' />
      <path d='M3.5 4.5H6.5V1.5' />
      {/* Digit '2' */}
      <path d='M6 9C6 7.6 7.2 6.8 8.5 6.8C9.8 6.8 11 7.6 11 8.8C11 10.3 8.5 11.8 6.5 13.5H11' />
      {/* Digit '4' */}
      <path d='M15.5 7L12.5 11.5H17M15.5 9.8V13.5' />
      {/* Maternal Heartbeat / Vital Pulse Siaga */}
      <path d='M5.5 17.5H8L9.5 15.5L11.5 19.5L13.5 16.5L15 17.5H18.5' strokeWidth='1.6' />
    </svg>
  );
}

function BpjsHealthCardIcon({ className }: { className?: string }) {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      {/* Smart Healthcare & BPJS Card Body */}
      <rect x='2.5' y='4.5' width='19' height='13.5' rx='2.5' />
      {/* Smart Card Chip */}
      <rect
        x='5.5'
        y='7.5'
        width='3.5'
        height='3'
        rx='0.6'
        fill='currentColor'
        fillOpacity='0.2'
        strokeWidth='1.4'
      />
      {/* Medical Cross on the Card */}
      <path d='M16 6.8V10.2M14.3 8.5H17.7' />
      {/* Card Identification Lines */}
      <path d='M5.5 13.5H11' />
      {/* Verified / Accepted Approval Seal with Checkmark */}
      <circle cx='17.5' cy='17' r='4.5' fill='currentColor' fillOpacity='0.15' />
      <circle cx='17.5' cy='17' r='4.5' />
      <path d='M15.5 17L17 18.5L20 15.5' />
    </svg>
  );
}

export function FacilityContextIcon({ src, className }: { src: string; className?: string }) {
  if (src.includes('spesialis-persalinan') || src.includes('Choose-Icon-1')) {
    return <MaternityCareIcon className={className} />;
  }
  if (src.includes('khitan-laser') || src.includes('Choose-Icon-4')) {
    return <LaserPediatricIcon className={className} />;
  }
  if (src.includes('persalinan-24jam') || src.includes('Choose-Icon-3')) {
    return <Emergency24hIcon className={className} />;
  }
  if (src.includes('terima-bpjs') || src.includes('Choose-Icon-2')) {
    return <BpjsHealthCardIcon className={className} />;
  }
  return null;
}
