import {Children} from 'react'

export interface JoinProps {
	children: React.ReactNode[]
	separator?: React.ReactNode
}

export default function Join({
	children,
	separator,
}: JoinProps) {
	const count = Children.count(children)
	return (
		<>
			{Children.map(children, (child, index) => (
				<>
					{child}
					{index !== count - 1 ? separator : null}
				</>
			))}
		</>
	)
}
