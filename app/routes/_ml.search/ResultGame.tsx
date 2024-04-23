import {Link} from '@remix-run/react'
import {ExternalLink} from 'lucide-react'
import {BggSearchResult} from '~/lib/bgg'
import {Card} from '~/components/ui/card'
import {cn} from '~/lib/utils'
import {ScoreDisplay} from '~/components/ScoreDisplay'

export function ResultGame({
	game,
	score,
}: {
	game: BggSearchResult
	score: number | undefined
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
					<div>
						{game.name} (
						<em>
							<small>{game.yearPublished}</small>
						</em>
						)
					</div>
					{score && (
						<div>
							<ScoreDisplay score={score} />
						</div>
					)}
				</Card>
			</Link>
			<Link
				to={`https://boardgamegeek.com/boardgame/${game.id}`}
				target='_blank'
				rel='noreferrer'
				onClick={(e) => {
					e.stopPropagation()
				}}
				className='absolute right-2 top-2'
			>
				<ExternalLink size='1rem' />
			</Link>
		</div>
	)
}
