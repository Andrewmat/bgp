import {Link} from '@remix-run/react'
import {ExternalLink} from 'lucide-react'
import {BggSearchResult} from '~/lib/bgg'
import {Card} from '~/components/ui/card'
import {cn} from '~/lib/utils'

export function ResultGame({
	game,
}: {
	game: BggSearchResult
}) {
	return (
		<div className='relative'>
			<Link
				to={`/game/${game.id}`}
				className={cn(
					'[&>*]:hover:bg-accent',
					'[&>*]:hover:text-accent-foreground',
					'[&>*]:focus-visible:bg-accent',
					'[&>*]:focus-visible:text-accent-foreground',
				)}
			>
				<Card className='p-5 h-full'>
					{game.name} (
					<em>
						<small>{game.yearPublished}</small>
					</em>
					)
				</Card>
			</Link>
			<Link
				to={`https://boardgamegeek.com/boardgame/${game.id}`}
				target='_blank'
				rel='noreferrer'
				onClick={(e) => e.stopPropagation()}
				className='absolute right-2 top-2'
			>
				<ExternalLink size='1rem' />
			</Link>
		</div>
	)
}
