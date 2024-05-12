import {CardHeader, CardTitle} from '~/components/ui/card'

export function Section({
	children,
	title,
	subtitle,
}: {
	children: React.ReactNode
	title: React.ReactNode
	subtitle?: React.ReactNode
}) {
	return (
		<>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{subtitle && (
					<span className='text-md text-muted-foreground'>
						{subtitle}
					</span>
				)}
			</CardHeader>
			<article>{children}</article>
		</>
	)
}
