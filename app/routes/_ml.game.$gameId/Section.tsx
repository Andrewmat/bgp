import {PropsWithChildren} from 'react'
import {Separator} from '~/components/ui/separator'

export function Section({
	children,
	title,
}: PropsWithChildren<{title: React.ReactNode}>) {
	return (
		<div className='px-6 text-sm'>
			<h2 className='text-lg'>{title}</h2>
			<Separator className='mb-2' />
			{children}
		</div>
	)
}
