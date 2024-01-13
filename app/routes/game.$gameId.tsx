import {LoaderFunctionArgs, json} from '@remix-run/node'
import {
	Link,
	useFetcher,
	useLoaderData,
} from '@remix-run/react'
import {ExternalLink, Star} from 'lucide-react'
import {useEffect, useState} from 'react'
import invariant from 'tiny-invariant'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/ui/avatar'
import {
	Card,
	CardContent,
	CardFooter,
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
import {searchGameId} from '~/lib/bgg'
import {getScore} from '~/lib/db/score.server'
import {isAuthenticated} from '~/lib/login/auth.server'
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
	const game = await searchGameId(gameId)
	const user = await isAuthenticated(request)

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
				<CardHeader>
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
					>
						<ExternalLink size='1em' />
					</Link>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col gap-2'>
						<span>
							{game.minPlayers} - {game.maxPlayers} players
						</span>
						<span>
							{game.minPlayTime} - {game.maxPlayTime} min
						</span>
						<span>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Nº de jogadores</TableHead>
										<TableHead>Best</TableHead>
										<TableHead>Recommended</TableHead>
										<TableHead>Not Recommended</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{game.numPlayerSuggestion.map((sug) => (
										<TableRow key={sug.numPlayers}>
											<TableCell>
												{sug.numPlayers}
											</TableCell>
											<TableCell>
												{sug.best} (
												{(
													(Number(sug.best) * 100) /
													(Number(sug.best) +
														Number(sug.recommended) +
														Number(sug.notRecommended))
												).toFixed(2)}
												%)
											</TableCell>
											<TableCell>
												{sug.recommended} (
												{(
													(Number(sug.recommended) * 100) /
													(Number(sug.best) +
														Number(sug.recommended) +
														Number(sug.notRecommended))
												).toFixed(2)}
												%)
											</TableCell>
											<TableCell>
												{sug.notRecommended} (
												{(
													(Number(sug.notRecommended) *
														100) /
													(Number(sug.best) +
														Number(sug.recommended) +
														Number(sug.notRecommended))
												).toFixed(2)}
												%)
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</span>
					</div>
				</CardContent>
				<CardFooter>
					<EvaluationForm gameId={game.id} score={score} />
				</CardFooter>
			</Card>
		</div>
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
	const selected = score ? score - 1 : 0
	const fetcher = useFetcher()
	const optimistic = fetcher.formData
		? Number(fetcher.formData.get('score')) - 1
		: undefined
	const highlighted =
		typeof hover === 'number'
			? hover
			: optimistic ?? selected
	return (
		<div className='flex'>
			{Array.from({length: 5}).map((_, i) => (
				<fetcher.Form
					key={i}
					method='POST'
					action={`/game/${gameId}/evaluate`}
				>
					<input type='hidden' name='score' value={i + 1} />
					<button className='appearance-none' type='submit'>
						<Star
							className={cn(
								'px-1 w-12',
								i <= highlighted && 'fill-green-500',
							)}
							onMouseOver={() => setHover(i)}
							onMouseOut={() => setHover(undefined)}
						/>
					</button>
				</fetcher.Form>
			))}
		</div>
	)
}
