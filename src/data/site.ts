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
  { label: 'works', href: '#works' },
  { label: 'about', href: '#about' },
  { label: 'get in touch', href: '#contact' },
]

export const contactLinks = {
  email: {
    label: 'reach out: a.cheban@gmail.com',
    href: 'mailto:a.cheban@gmail.com',
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
  role: 'UX/UI and product design',
}
