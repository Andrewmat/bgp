import {CardTitle} from './ui/card'
import {Link} from '@remix-run/react'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from './ui/avatar'
import {BggBoardgame} from '~/lib/bgg'

export function GameLink({game}: {game: BggBoardgame}) {
	return (
		<Link
			to={`/game/${game.id}`}
			className='flex gap-2 items-center hover:underline focus:underline'
		>
			<Avatar>
				<AvatarImage
					src={game.thumbnail}
					height='40'
					width='40'
				/>
				<AvatarFallback>{game.name}</AvatarFallback>
			</Avatar>
			<CardTitle>{game.name}</CardTitle>
		</Link>
	)
}
