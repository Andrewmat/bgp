import {
	LinksFunction,
	LoaderFunctionArgs,
	MetaFunction,
	defer,
} from '@remix-run/node'
import {Await, useLoaderData} from '@remix-run/react'
import React, {Suspense} from 'react'
import {
	ScoreGame,
	Scores,
	ScoresFallback,
} from '~/components/Scores'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {getGamesListId} from '~/lib/bgg'
import {
	getRecommendedToRate,
	getScoresByUser,
} from '~/lib/db/score.server'
import {assertAuthenticated} from '~/lib/login/auth.server'

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

const PAGE_SIZE = 6

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const searchParams = new URL(request.url).searchParams

	const ownPage =
		Number(searchParams.get('score_page')) || 1
	const recommendationPage =
		Number(searchParams.get('rec_page')) || 1

	return defer({
		ownPage,
		recommendationPage,
		own: getOwnGames(user.id, ownPage),
		recommendations: getRecommendedToRate({
			userId: user.id,
			skip: (recommendationPage - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
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
				<Section title='Recomendações'>
					<Suspense
						fallback={<ScoresFallback pageSize={5} />}
					>
						<Await resolve={recommendations}>
							{(recommendationsResolved) => (
								<Scores
									page={recommendationPage}
									pageSize={PAGE_SIZE}
									scores={
										recommendationsResolved as ScoreGame[]
									}
									canEditScore
									pageParam='rec_page'
								/>
							)}
						</Await>
					</Suspense>
				</Section>
				<Section title='Seus jogos'>
					<Suspense
						fallback={<ScoresFallback pageSize={5} />}
					>
						<Await resolve={own}>
							{(score) => (
								<Scores
									page={ownPage}
									pageSize={PAGE_SIZE}
									scores={score as ScoreGame[]}
									canEditScore
									pageParam='score_page'
								/>
							)}
						</Await>
					</Suspense>
				</Section>
			</CardContent>
		</Card>
	)
}

function Section({
	children,
	title,
}: {
	children: React.ReactNode
	title: React.ReactNode
}) {
	return (
		<>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<article>{children}</article>
		</>
	)
}

async function getOwnGames(
	userId: string,
	scorePage: number,
): Promise<ScoreGame[]> {
	const scores = await getScoresByUser({
		userId: userId,
		skip: (scorePage - 1) * PAGE_SIZE,
		take: PAGE_SIZE,
	})

	const games = await getGamesListId(
		scores.map((s) => s.gameId),
	)

	return games.map((game) => ({
		game,
		score: scores.find((s) => s.gameId)!.value,
	}))
}
