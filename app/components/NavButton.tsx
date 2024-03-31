import {NavLink, NavLinkProps} from '@remix-run/react'
import {ButtonProps, buttonVariants} from './ui/button'

export default function NavButton({
	to,
	children,
}: {
	to: NavLinkProps['to']
	children: ButtonProps['children']
}) {
	return (
		<NavLink
			to={to}
			className={({isActive, isPending}) =>
				buttonVariants({
					variant:
						isActive || isPending ? 'secondary' : 'link',
					className: isPending ? 'opacity-60' : undefined,
				})
			}
		>
			{children}
		</NavLink>
	)
}
