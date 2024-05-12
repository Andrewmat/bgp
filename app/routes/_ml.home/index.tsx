import {
	LinksFunction,
	LoaderFunctionArgs,
	MetaFunction,
	defer,
} from '@remix-run/node'
import {Await, useLoaderData} from '@remix-run/react'
import {PropsWithChildren, Suspense} from 'react'
import {
	ScoreList,
	ScoresFallback,
} from '~/components/ScoreList'
import {Card, CardContent} from '~/components/ui/card'
import {getGamesListId} from '~/lib/bgg'
import {
	getRecommendedToRate,
	getScoresByUser,
} from '~/lib/db/score.server'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {ScoreGame} from '~/lib/db/score.type'
import {Section} from './Section'
import {EvaluationFormRecommendation} from './EvaluationFormRecommendation'
import {EvaluationFormOwn} from './EvaluationFormOwn'
import {AlertTriangleIcon} from 'lucide-react'

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
						<SectionRecommendation>
							<ScoresFallback pageSize={5} />
						</SectionRecommendation>
					}
				>
					<Await
						resolve={recommendations}
						errorElement={
							<SectionRecommendation>
								<SectionErrorMessage />
							</SectionRecommendation>
						}
					>
						{(recommendationsResolved) =>
							recommendationsResolved.length > 0 && (
								<SectionRecommendation>
									<ScoreList
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
								</SectionRecommendation>
							)
						}
					</Await>
				</Suspense>

				<Suspense
					fallback={
						<SectionOwn>
							<ScoresFallback pageSize={5} />
						</SectionOwn>
					}
				>
					<Await
						resolve={own}
						errorElement={
							<SectionOwn>
								<SectionErrorMessage />
							</SectionOwn>
						}
					>
						{(ownResolved) =>
							ownResolved.length > 0 && (
								<SectionOwn>
									<ScoreList
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
								</SectionOwn>
							)
						}
					</Await>
				</Suspense>
			</CardContent>
		</Card>
	)
}

function SectionRecommendation({
	children,
}: PropsWithChildren) {
	return (
		<Section
			title='Recomendações'
			subtitle='Alguns jogos para você votar'
		>
			{children}
		</Section>
	)
}

function SectionOwn({children}: PropsWithChildren) {
	return (
		<Section
			title='Seus jogos'
			subtitle='Os jogos que você já votou'
		>
			{children}
		</Section>
	)
}

function SectionErrorMessage() {
	return (
		<div className='p-6'>
			<h2 className='text-xl flex gap-2'>
				<AlertTriangleIcon />
				Ops
			</h2>
			<span className='text-lg'>
				Não conseguimos carregar essa seção
			</span>
		</div>
	)
}

async function getOwnGames(
	userId: string,
	scorePage: number,
	orderBy: 'updatedAt' | 'value',
): Promise<ScoreGame[]> {
	const {result: scores} = await getScoresByUser({
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
