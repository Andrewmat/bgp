import {LoaderFunctionArgs, json} from '@remix-run/node'
import {
	Link,
	useFetcher,
	useLoaderData,
} from '@remix-run/react'
import {
	Dice1Icon,
	Dice2Icon,
	Dice3Icon,
	Dice4Icon,
	Dice5Icon,
	Dice6Icon,
	ExternalLink,
	X,
} from 'lucide-react'
import {cloneElement, useState} from 'react'
import invariant from 'tiny-invariant'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/ui/avatar'
import {Button} from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {BggBoardgame, getGameId} from '~/lib/bgg'
import {getScore} from '~/lib/db/score.server'
import {getUser} from '~/lib/login/auth.server'
import {cn} from '~/lib/utils'

export async function loader({
	params,
	request,
}: LoaderFunctionArgs) {
	const gameId = params.gameId
	invariant(
		typeof gameId === 'string',
		'Could not read gameId',
	)
	const game = await getGameId(gameId)
	const user = await getUser(request)

	let score: Awaited<ReturnType<typeof getScore>> = null

	if (user?.email) {
		score = await getScore({
			gameId,
			userEmail: user.email,
		})
	}
	return json({game, score: score?.value})
}

export default function GameDetailsPage() {
	const {game, score} = useLoaderData<typeof loader>()
	return (
		<div className='container mt-12'>
			<Card>
				<CardHeader className='flex flex-row justify-between'>
					<div className='flex flex-row-align-baseline gap-2'>
						<Avatar>
							<AvatarImage src={game.image} />
							<AvatarFallback>
								{game.name.slice(0, 2)}
							</AvatarFallback>
						</Avatar>
						<CardTitle>{game.name}</CardTitle>
						<Link
							to={`https://boardgamegeek.com/boardgame/${game.id}`}
							target='_blank'
							onClick={(e) => e.stopPropagation()}
							rel='noreferrer'
							className='flex place-items-center'
						>
							<ExternalLink size='1em' />
						</Link>
					</div>
					<EvaluationForm gameId={game.id} score={score} />
				</CardHeader>
				<CardContent>
					<div className='grid gap-2 md:grid-cols-4 lg:grid-cols-6'>
						<div>
							<p>
								{game.minPlayers === game.maxPlayers
									? game.minPlayers
									: `${game.minPlayers} - ${game.maxPlayers}`}{' '}
								players
							</p>
							<p>
								{game.minPlayTime === game.maxPlayTime
									? game.minPlayTime
									: `${game.minPlayTime} - ${game.maxPlayTime}`}{' '}
								min
							</p>
						</div>
						<div className='md:col-span-3 lg:col-span-5'>
							<Card>
								<PlayersTable game={game as BggBoardgame} />
							</Card>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function PlayersTable({game}: {game: BggBoardgame}) {
	return (
		<Table>
			<TableHeader className='bg-accent'>
				<TableRow>
					<TableHead className='text-accent-foreground'>
						Nº de jogadores
					</TableHead>
					<TableHead className='text-accent-foreground'>
						Best
					</TableHead>
					<TableHead className='text-accent-foreground'>
						Recommended
					</TableHead>
					<TableHead className='text-accent-foreground'>
						Not Recommended
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{game.numPlayerSuggestion.map((suggestion) => (
					<PlayerNumberItem
						key={suggestion.numPlayers}
						suggestion={suggestion}
					/>
				))}
			</TableBody>
		</Table>
	)
}

function PlayerNumberItem({
	suggestion,
}: {
	suggestion: BggBoardgame['numPlayerSuggestion'][number]
}) {
	const best = Number(suggestion.best)
	const recommended = Number(suggestion.recommended)
	const notRecommended = Number(suggestion.notRecommended)
	const sumVotes = best + recommended + notRecommended

	return (
		<TableRow>
			<TableCell>{suggestion.numPlayers}</TableCell>
			<TableCell>
				{((best * 100) / sumVotes).toFixed(1)}% ({best})
			</TableCell>
			<TableCell>
				{((recommended * 100) / sumVotes).toFixed(1)}% (
				{recommended})
			</TableCell>
			<TableCell>
				{((notRecommended * 100) / sumVotes).toFixed(1)}% (
				{notRecommended})
			</TableCell>
		</TableRow>
	)
}

function EvaluationForm({
	gameId,
	score,
}: {
	gameId: string
	score: number | undefined
}) {
	const [hover, setHover] = useState<number>()
	const selected = score ? score : 0
	const fetcher = useFetcher()
	const optimistic = fetcher.formData
		? Number(fetcher.formData.get('score'))
		: undefined
	const highlighted =
		typeof hover === 'number'
			? hover
			: optimistic ?? selected
	return (
		<div className='flex'>
			{[
				// eslint-disable-next-line react/jsx-key
				<Dice1Icon />,
				// eslint-disable-next-line react/jsx-key
				<Dice2Icon />,
				// eslint-disable-next-line react/jsx-key
				<Dice3Icon />,
				// eslint-disable-next-line react/jsx-key
				<Dice4Icon />,
				// eslint-disable-next-line react/jsx-key
				<Dice5Icon />,
				// eslint-disable-next-line react/jsx-key
				<Dice6Icon />,
			].map((element, i) => (
				<fetcher.Form
					key={`dice${i}`}
					method='POST'
					action={`/game/${gameId}/evaluate`}
				>
					<input type='hidden' name='score' value={i + 1} />
					<button className='appearance-none' type='submit'>
						{cloneElement(element, {
							size: 30,
							className: cn(
								'pl-0 pr-2',
								i < highlighted && 'fill-green-500',
							),
							onMouseOver: () => setHover(i + 1),
							onMouseOut: () => setHover(undefined),
						})}
					</button>
				</fetcher.Form>
			))}
			<fetcher.Form
				method='POST'
				action={`/game/${gameId}/evaluate`}
			>
				<input type='hidden' name='method' value='delete' />
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<button
								className='appearance-none'
								type='submit'
							>
								<X size={30} className='stroke-primary' />
							</button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Remove score</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</fetcher.Form>
		</div>
	)
}
