import React, {
	ComponentPropsWithoutRef as ComponentProps,
} from 'react'
import {X} from 'lucide-react'
import {cn} from '~/lib/utils'
import {Alert} from './alert'

export const AlertClosable = React.forwardRef<
	HTMLDivElement,
	ComponentProps<typeof Alert> & {
		btnClassName?: ComponentProps<'button'>['className']
	}
>(({children, className, btnClassName, ...props}, ref) => {
	const [isClosed, close] = React.useReducer(
		() => true,
		false,
	)

	return isClosed ? null : (
		<Alert
			className={cn(className, 'flex justify-between')}
			{...props}
			ref={ref}
		>
			{children}
			<button
				onClick={close}
				className={cn(
					'appearance-none',
					'rounded-full',
					btnClassName,
				)}
			>
				<X />
			</button>
		</Alert>
	)
})
AlertClosable.displayName = 'AlertClosable'
