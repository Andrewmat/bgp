import {
	Link as RemixLink,
	NavLink as RemixNavLink,
	LinkProps,
	NavLinkProps,
} from '@remix-run/react'
import {Button, ButtonProps} from './button'

interface SLinkProps extends LinkProps {
	variant?: ButtonProps['variant']
	size?: ButtonProps['size']
	className?: ButtonProps['className']
}

// Link as Button
export default function SLink({
	variant = 'link',
	size,
	className,
	...delegatedProps
}: SLinkProps) {
	return (
		<Button
			asChild
			variant={variant}
			size={size}
			className={className}
		>
			<RemixLink {...delegatedProps} />
		</Button>
	)
}
