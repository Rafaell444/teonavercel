'use client'

import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react'

/* ----------------------------- Button ----------------------------- */
type ButtonVariant = 'primary' | 'ghost' | 'dark' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface UIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:brightness-110 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm shadow-sm shadow-primary/20',
  dark: 'bg-foreground text-background hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/20 active:translate-y-0',
  ghost:
    'bg-transparent text-current border border-current/30 hover:border-current/60 hover:bg-current/10 hover:-translate-y-0.5 active:translate-y-0',
  outline:
    'bg-transparent text-foreground border border-border hover:bg-secondary hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-sm',
}

export function UIButton({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: UIButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase tracking-[0.12em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  )
}

/* ----------------------------- Card ----------------------------- */
export function UICard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card text-card-foreground',
        className,
      )}
      {...props}
    />
  )
}

/* ----------------------------- Input ----------------------------- */
export function UIInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        className,
      )}
      {...props}
    />
  )
}

/* ----------------------------- Badge ----------------------------- */
export function UIBadge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary',
        className,
      )}
      {...props}
    />
  )
}

/* ----------------------------- Eyebrow ----------------------------- */
export function Eyebrow({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.28em] text-primary',
        className,
      )}
      {...props}
    />
  )
}
