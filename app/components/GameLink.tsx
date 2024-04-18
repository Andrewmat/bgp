import {CardTitle} from './ui/card'
import {Link} from '@remix-run/react'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from './ui/avatar'
import {BggBoardgame} from '~/lib/bgg'
import {ClassValue} from 'clsx'
import {cn} from '~/lib/utils'

export function GameLink({
	game,
	className,
}: {
	game: BggBoardgame
	className?: ClassValue
}) {
	return (
		<Link
			to={`/game/${game.id}`}
			className={cn(
				'flex gap-2 items-center hover:underline focus:underline',
				className,
			)}
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
