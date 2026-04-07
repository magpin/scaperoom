interface IconProps {
  name: 
    | 'clock'
    | 'star'
    | 'trophy'
    | 'key'
    | 'check'
    | 'x'
    | 'play'
    | 'users'
    | 'copy'
    | 'arrow-right'
    | 'book'
    | 'target'
    | 'shield'
    | 'zap'
    | 'lock'
    | 'unlock'
  size?: number
  className?: string
}

const icons: Record<IconProps['name'], string> = {
  clock: 'M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M6 9v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9M6 9h12M9 21v-6a3 3 0 0 1 6 0v6',
  key: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4',
  check: 'M5 12l5 5L20 7',
  x: 'M18 6 6 18M6 6l12 12',
  play: 'M5 3l14 9-14 9V3z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  copy: 'M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2',
  'arrow-right': 'M5 12h14m-7-7 7 7-7 7',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z',
  target: 'M22 12h-4M6 12H2m10-6V2m0 20v-4m7.07-7.07 2.83-2.83M4.1 19.9l2.83-2.83m0-10.14L4.1 4.1m15.8 15.8-2.83-2.83M12 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8Z',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-2 0V7a5 5 0 0 0-10 0v4',
  unlock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-2 0V7a5 5 0 0 0-9.9-1',
}

export function Icon({ name, size = 20, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={icons[name]} />
    </svg>
  )
}
