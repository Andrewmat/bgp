import {Link, useLoaderData} from '@remix-run/react'
import {ExternalLink} from 'lucide-react'
import invariant from 'tiny-invariant'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/ui/avatar'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {BggBoardgame, getGameId} from '~/lib/bgg'
import {
	getScoreByUserGame,
	getScoresFollowingGame,
} from '~/lib/db/score.server'
import {withUser} from '~/lib/remix/wrapUser'
import {EvaluationForm} from '~/components/EvaluationForm'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {PropsWithChildren, useMemo} from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {DiceScore} from '~/components/DiceScore'
import {Separator} from '~/components/ui/separator'
import SLink from '~/components/ui/SLink'
import {Stats} from '~/components/Stats'

export const loader = withUser(async ({params, user}) => {
	const gameId = params.gameId
	invariant(
		typeof gameId === 'string',
		'Could not read gameId',
	)
	const game = await getGameId(gameId)
	let score: Awaited<
		ReturnType<typeof getScoreByUserGame>
	> = null
	let followingScore: Awaited<
		ReturnType<typeof getScoresFollowingGame>
	> | null = null

	if (user?.id) {
		score = await getScoreByUserGame({
			gameId,
			userId: user.id,
		})
		followingScore = await getScoresFollowingGame({
			gameId,
			userId: user.id,
		})
	}
	return {game, score: score?.value, followingScore}
})

export default function GameDetailsPage() {
	const {game, score, user, followingScore} =
		useLoaderData<typeof loader>()
	return (
		<div className='flex flex-col gap-4'>
			<GameBggInfo
				game={game as BggBoardgame}
				score={score}
				showEvaluation={Boolean(user)}
			/>
			{followingScore && followingScore.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>
							Notas de quem você tá seguindo
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='flex flex-col gap-2 items-start justify-start'>
							<Stats
								values={followingScore.map((s) => s.value)}
							/>
						</div>
						<Table>
							<TableHeader>
								<TableHead>Usuário</TableHead>
								<TableHead className='text-center'>
									Nota
								</TableHead>
							</TableHeader>
							<TableBody>
								{followingScore.map((fs) => (
									<TableRow key={fs.user.id}>
										<TableCell className='p-1'>
											{fs.user.name}
										</TableCell>
										<TableCell className='p-1 text-center'>
											<DiceScore score={fs.value} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

function GameBggInfo(
	props: {
		game: BggBoardgame
	} & (
		| {showEvaluation: true; score: number | undefined}
		| {showEvaluation: false}
	),
) {
	const {game, showEvaluation} = props
	return (
		<Card>
			<CardHeader className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
				<div className='flex gap-2'>
					<Avatar>
						<AvatarImage src={game.image} />
						<AvatarFallback>
							{game.name.slice(0, 2)}
						</AvatarFallback>
					</Avatar>
					<CardTitle>
						{game.name}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger className='ml-2'>
									<Link
										to={`https://boardgamegeek.com/boardgame/${game.id}`}
										target='_blank'
										rel='noreferrer'
									>
										<ExternalLink
											className='stroke-muted-foreground'
											size='0.8rem'
										/>
									</Link>
								</TooltipTrigger>
								<TooltipContent>
									Abrir no BoardGameGeek
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</CardTitle>
				</div>
				<div className='w-[260px] md:w-[300px]'>
					{showEvaluation && (
						<EvaluationForm
							gameId={game.id}
							score={props.score}
							className='flex-row-reverse'
						/>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className='flex flex-col gap-4'>
					<Section title='Geral'>
						<RangeInfo
							min={game.minPlayers}
							max={game.maxPlayers}
							appendix={
								game.maxPlayers > 1
									? 'jogadores'
									: 'jogador'
							}
						/>
						<RangeInfo
							min={game.minPlayTime}
							max={game.maxPlayTime}
							appendix='min'
						/>
						{game.bga.implemented && <em>Tem no BGA!</em>}
					</Section>
					<Section title='Mecânicas'>
						<div className='text-muted-foreground'>
							{game.mechanics.map((m) => (
								<div key={m.id}>
									<Link
										to={`https://boardgamegeek.com/boardgamemechanic/${m.id}`}
										rel='noreferrer'
										className='hover:underline focus:underline'
									>
										{m.label}
									</Link>
								</div>
							))}
						</div>
					</Section>
				</div>
			</CardContent>
		</Card>
	)
}

function Section({
	children,
	title,
}: PropsWithChildren<{title: React.ReactNode}>) {
	return (
		<div className='text-sm'>
			<h2 className='text-lg'>{title}</h2>
			<Separator className='my-2' />
			{children}
		</div>
	)
}

function RangeInfo({
	min,
	max,
	appendix,
}: {
	min: number
	max: number
	appendix: string
}) {
	return (
		<p>
			{min === max ? min : `${min} - ${max}`} {appendix}
		</p>
	)
}
