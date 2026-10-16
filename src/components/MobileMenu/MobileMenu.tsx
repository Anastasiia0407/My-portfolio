import { useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { nav } from '../../data/site.ts'
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY } from '../../hooks/useMediaQuery.ts'
import './MobileMenu.css'

/**
 * Mobile menu (Figma 66:362), below 760px only. The button's two lines morph into an "X";
 * the overlay fades in. While open: page scroll is locked, the rest of the page is inert,
 * focus is trapped in [button + links], and Escape closes and returns focus to the button.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Layout effect so the scroll lock is released synchronously when the menu closes,
  // before a link click scrolls to its section.
  useLayoutEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    const outside = [document.getElementById('main'), document.getElementById('contact')]
    outside.forEach((el) => el?.setAttribute('inert', ''))

    const focusables = () => [buttonRef.current, ...(menuRef.current?.querySelectorAll<HTMLElement>('a') ?? [])]
    focusables()[1]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables().filter((el): el is HTMLElement => el !== null)
      const index = items.indexOf(document.activeElement as HTMLElement)
      const next = event.shiftKey ? index - 1 : index + 1
      event.preventDefault()
      items[(next + items.length) % items.length]?.focus()
    }
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const onDesktop = () => desktop.matches && setOpen(false)

    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onDesktop)
    return () => {
      root.style.overflow = previousOverflow
      outside.forEach((el) => el?.removeAttribute('inert'))
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onDesktop)
    }
  }, [open])

  const toggle = () => {
    setOpen((value) => !value)
    buttonRef.current?.focus()
  }

  const goTo = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.querySelector<HTMLElement>(href)
    if (!target) return
    event.preventDefault()
    setOpen(false)
    // After the close commits (scroll unlocked, page no longer inert): scroll, then move focus there.
    requestAnimationFrame(() => {
      const instant = window.matchMedia(REDUCED_MOTION_QUERY).matches
      target.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' })
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      history.replaceState(null, '', href)
    })
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="menu-button"
        data-open={open || undefined}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={toggle}
      >
        <span className="menu-button__line" />
        <span className="menu-button__line" />
      </button>
      <div
        ref={menuRef}
        id="mobile-menu"
        className="menu"
        data-open={open || undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
      >
        <nav aria-label="Mobile">
          <ul className="menu__list">
            {nav.map((item) => (
              <li key={item.href}>
                <a className="menu__link touch-target" href={item.href} onClick={goTo(item.href)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
