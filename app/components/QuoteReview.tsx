import {ReactNode} from 'react'

export function Quote({
	quote,
	author,
}: {
	quote: ReactNode
	author: ReactNode
}) {
	return (
		<figure>
			<blockquote className='italic text-lg'>
				&ldquo;{quote}&rdquo;
			</blockquote>
			<figcaption className='text-end font-bold'>
				{author}
			</figcaption>
		</figure>
	)
}
