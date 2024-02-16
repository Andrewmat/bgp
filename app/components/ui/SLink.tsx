import {
	Link as RemixLink,
	LinkProps,
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
