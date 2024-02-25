import {
	LinksFunction,
	LoaderFunctionArgs,
	MetaFunction,
	json,
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {ScoreGame, Scores} from '~/components/Scores'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {getGameId} from '~/lib/bgg'
import {getScoresByUser} from '~/lib/db/score.server'
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

const PAGE_SIZE = 12

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const searchParams = new URL(request.url).searchParams

	const scorePage =
		Number(searchParams.get('score_page')) || 1
	const rawScores = await getScoresByUser({
		userId: user.id,
		skip: (scorePage - 1) * PAGE_SIZE,
		take: PAGE_SIZE,
	})
	const games = await Promise.all(
		rawScores.map((score) => getGameId(score.gameId)),
	)
	return json({
		scorePage,
		scores: rawScores.map((s) => ({
			score: s.value,
			game: games.find((g) => g.id === s.gameId)!,
		})),
	})
}

export default function HomePage() {
	const {scores, scorePage} = useLoaderData<typeof loader>()
	return (
		<Card>
			<CardHeader>
				<CardTitle>Home</CardTitle>
			</CardHeader>
			<CardContent>
				<Scores
					scorePage={scorePage}
					scores={scores as ScoreGame[]}
					canEditScore
				/>
			</CardContent>
		</Card>
	)
}
