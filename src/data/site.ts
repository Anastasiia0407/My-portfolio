export interface NavItem {
  label: string
  href: `#${string}`
}

export interface ContactLink {
  label: string
  href: string
  external: boolean
}

export const nav: NavItem[] = [
  { label: 'about', href: '#about' },
  { label: 'works', href: '#works' },
  { label: 'get in touch', href: '#contact' },
]

export const contactLinks = {
  email: {
    label: 'Reach out: A.cheban2025@gmail.com',
    href: 'mailto:a.cheban2025@gmail.com',
    external: false,
  },
  telegram: {
    label: 'Telegram',
    href: 'https://t.me/cheban_anastasiia',
    external: true,
  },
  linkedin: {
    label: 'Linkedin',
    href: 'https://www.linkedin.com/in/cheban-anastasiia',
    external: true,
  },
} satisfies Record<string, ContactLink>

export const owner = {
  name: 'Anastasiia Cheban',
  role: 'UX/UI and product designer',
  /** Hero tagline above the masked "DESIGNER" (Figma 61:182). */
  tagline: 'UX/UI · PRODUCT',
}
