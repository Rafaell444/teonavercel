'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Keyboard focus handling for a modal dialog. Attach the returned ref to the
 * dialog panel (which needs tabIndex={-1}). While `active`:
 *  - focus moves into the dialog when it opens,
 *  - Tab / Shift+Tab cycle inside it instead of reaching the page behind,
 *  - focus returns to whatever opened the dialog when it closes.
 */
export function useDialogFocus<T extends HTMLElement>(active = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const opener = document.activeElement as HTMLElement | null
    node.focus({ preventScroll: true })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement
      if (e.shiftKey && (current === first || current === node)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && current === last) {
        e.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      // Only hand focus back if it is still inside the dialog (or nowhere)
      if (!document.activeElement || document.activeElement === document.body || node.contains(document.activeElement)) {
        opener?.focus?.({ preventScroll: true })
      }
    }
  }, [active])

  return ref
}
