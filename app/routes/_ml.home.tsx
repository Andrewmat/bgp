import {
	LinksFunction,
	LoaderFunctionArgs,
	MetaFunction,
	defer,
} from '@remix-run/node'
import {
	Await,
	useFetcher,
	useLoaderData,
} from '@remix-run/react'
import {MegaphoneOffIcon} from 'lucide-react'
import React, {Suspense} from 'react'
import {EvaluationForm} from '~/components/EvaluationForm'
import {Scores, ScoresFallback} from '~/components/Scores'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {BggBoardgame, getGamesListId} from '~/lib/bgg'
import {
	getRecommendedToRate,
	getScoresByUser,
} from '~/lib/db/score.server'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {ScoreGame} from '~/lib/score.type'

export const meta: MetaFunction = () => {
	return [
		{
			title:
				'Home | BGP | Otimize sua decisão de jogos de tabuleiro',
		},
	]
}

export const links: LinksFunction = () => [
	{
		rel: 'dns-prefetch',
		href: 'https://cf.geekdo-images.com/',
	},
]

// export function shouldRevalidate({
// 	formAction,
// 	formMethod,
// }: ShouldRevalidateFunctionArgs) {
// 	// in evaluation, do not refresh path
// 	if (formMethod === 'POST' && formAction) {
// 		const matchEvaluate = matchPath(
// 			'game/:gameId/evaluate',
// 			formAction,
// 		)
// 		if (matchEvaluate?.params.gameId) {
// 			return false
// 		}
// 	}
// 	return true
// }

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const searchParams = new URL(request.url).searchParams

	const ownPage =
		Number(searchParams.get('score_page')) || 1
	const recommendationPage =
		Number(searchParams.get('rec_page')) || 1
	const orderByParam = searchParams.get('order_by')

	return defer({
		ownPage,
		recommendationPage,
		own: getOwnGames(
			user.id,
			ownPage,
			orderByParam === 'updatedAt' ? 'updatedAt' : 'value',
		),
		recommendations: getRecommendedToRate({
			userId: user.id,
			skip: (recommendationPage - 1) * 6,
			take: 6,
		}),
	})
}

export default function HomePage() {
	const {
		recommendationPage,
		ownPage,
		own,
		recommendations,
	} = useLoaderData<typeof loader>()
	return (
		<Card>
			<CardContent>
				<Suspense
					fallback={
						<Section
							title='Recomendações'
							subtitle='Alguns jogos para você votar'
						>
							<ScoresFallback pageSize={5} />
						</Section>
					}
				>
					<Await resolve={recommendations}>
						{(recommendationsResolved) =>
							recommendationsResolved.length > 0 && (
								<Section
									title='Recomendações'
									subtitle='Alguns jogos para você votar'
								>
									<Scores
										page={recommendationPage}
										pageSize={6}
										scores={
											recommendationsResolved as ScoreGame[]
										}
										pageParam='rec_page'
										empty='Não conseguimos te recomendar nada para votar'
										footer={
											// Component is injected with missing props
											// eslint-disable-next-line @typescript-eslint/ban-ts-comment
											// @ts-expect-error
											<EvaluationFormRecommendation />
										}
									/>
								</Section>
							)
						}
					</Await>
				</Suspense>

				<Suspense
					fallback={
						<Section
							title='Seus jogos'
							subtitle='Os jogos que você já votou'
						>
							<ScoresFallback pageSize={5} />
						</Section>
					}
				>
					<Await resolve={own}>
						{(ownResolved) =>
							ownResolved.length > 0 && (
								<Section
									title='Seus jogos'
									subtitle='Os jogos que você já votou'
								>
									<Scores
										page={ownPage}
										pageSize={12}
										scores={ownResolved as ScoreGame[]}
										pageParam='score_page'
										footer={
											// Component is injected with missing props
											// eslint-disable-next-line @typescript-eslint/ban-ts-comment
											// @ts-expect-error
											<EvaluationFormOwn />
										}
									/>
								</Section>
							)
						}
					</Await>
				</Suspense>
			</CardContent>
		</Card>
	)
}

function Section({
	children,
	title,
	subtitle,
}: {
	children: React.ReactNode
	title: React.ReactNode
	subtitle?: React.ReactNode
}) {
	return (
		<>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{subtitle && (
					<span className='text-md text-muted-foreground'>
						{subtitle}
					</span>
				)}
			</CardHeader>
			<article>{children}</article>
		</>
	)
}

function EvaluationFormRecommendation({
	game,
	score,
}: {
	game: BggBoardgame
	score: number | undefined
}) {
	const fetcher = useFetcher()
	return (
		<EvaluationForm
			gameId={game.id}
			score={score}
			side={
				<fetcher.Form
					action={`/game/${game.id}/relation`}
					method='POST'
					className='flex items-center justify-center w-full h-full'
				>
					<input
						type='hidden'
						name='intent'
						value='ignore'
					/>
					<input type='hidden' name='value' value='true' />
					<Tooltip>
						<TooltipTrigger type='submit'>
							<MegaphoneOffIcon className='stroke-muted-foreground hover:stroke-destructive-foreground hover:fill-destructive focus-visible:stroke-destructive-foreground focus-visible:fill-destructive' />
						</TooltipTrigger>
						<TooltipContent>
							Silenciar recomendação
						</TooltipContent>
					</Tooltip>
				</fetcher.Form>
			}
		/>
	)
}

function EvaluationFormOwn({
	game,
	score,
}: {
	game: BggBoardgame
	score: number | undefined
}) {
	return <EvaluationForm gameId={game.id} score={score} />
}

async function getOwnGames(
	userId: string,
	scorePage: number,
	orderBy: 'updatedAt' | 'value',
): Promise<ScoreGame[]> {
	const scores = await getScoresByUser({
		userId: userId,
		skip: (scorePage - 1) * 12,
		take: 12,
		orderBy,
	})

	if (scores.length === 0) {
		return []
	}

	const games = await getGamesListId(
		scores.map((s) => s.gameId),
	)

	return games.map((game) => ({
		game,
		score: scores.find((score) => score.gameId === game.id)!
			.value,
	}))
}
