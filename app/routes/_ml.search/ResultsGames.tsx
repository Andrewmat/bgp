import {Link} from '@remix-run/react'
import {ExternalLink} from 'lucide-react'
import {BggSearchResult} from '~/lib/bgg'
import {Card} from '~/components/ui/card'
import {cn} from '~/lib/utils'

export function ResultsGames({
	results,
}: {
	results: BggSearchResult[]
}) {
	return (
		<div>
			<h1 className='mb-2'>Games ({results.length})</h1>
			<ul className='grid grid-cols-3 gap-2 self-start'>
				{results.map((game) => (
					<li key={game.id} className='relative'>
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
							<ExternalLink size='0.8rem' />
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
