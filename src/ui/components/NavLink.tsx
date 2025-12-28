import { NavLink as RouterNavLink, type NavLinkProps } from 'react-router-dom'
import { forwardRef } from 'react'

interface NavLinkCompatProps extends Omit<NavLinkProps, 'className'> {
  className?: string
  activeClassName?: string
  pendingClassName?: string
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) => {
          const classes = [
            className,
            isActive ? activeClassName : '',
            isPending ? pendingClassName : '',
          ]
            .filter(Boolean)
            .join(' ')
          return classes
        }}
        {...props}
      />
    )
  },
)

NavLink.displayName = 'NavLink'

export { NavLink }
