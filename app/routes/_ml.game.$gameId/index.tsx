import {
	MetaFunction,
	Outlet,
	isRouteErrorResponse,
	json,
	useLoaderData,
	useParams,
	useRouteError,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Card} from '~/components/ui/card'
import {BggBoardgame, getGameId} from '~/lib/bgg'
import {getScoreByUserGame} from '~/lib/db/score.server'
import {GameHeader} from './GameHeader'
import {Alert} from '~/components/ui/alert'
import {getSessionUser} from '~/lib/login/auth.server'
import {
	LinksFunction,
	LoaderFunctionArgs,
} from '@remix-run/node'
import {getGameUser} from '~/lib/db/gameuser.server'
import NavButton from '~/components/NavButton'
import {Separator} from '~/components/ui/separator'

export const meta: MetaFunction<typeof loader> = ({
	data,
}) => {
	return [
		{
			title: data
				? `${data.game.name} | BGP`
				: 'Jogos de mesa | BGP',
		},
	]
}

export const links: LinksFunction = () => [
	{
		rel: 'dns-prefetch',
		href: 'https://cf.geekdo-images.com/',
	},
]

export const loader = async ({
	request,
	params,
}: LoaderFunctionArgs) => {
	const user = await getSessionUser(request)
	const gameId = params.gameId
	invariant(
		typeof gameId === 'string',
		'Could not read gameId',
	)
	const game = await getGameId(gameId, true)

	if (user?.id == null) {
		return json({
			game,
			user,
			score: null,
			isIgnored: null,
			isBookmarked: null,
		})
	}

	const [score, relation] = await Promise.all([
		getScoreByUserGame({
			gameId,
			userId: user.id,
		}),
		getGameUser({userId: user.id, gameId: game.id}),
	])

	return json({
		game,
		score: score?.value,
		user,
		isIgnored: relation?.ignored,
		isBookmarked: relation?.bookmarked,
	})
}

export default function GameDetailsPage() {
	const {game, score, user, isIgnored, isBookmarked} =
		useLoaderData<typeof loader>()

	return (
		<Card className='flex flex-col gap-2 pb-6'>
			<GameHeader
				game={game as BggBoardgame}
				score={score ?? undefined}
				showActions={Boolean(user)}
				isIgnored={isIgnored ?? false}
				isBookmarked={isBookmarked ?? false}
			/>

			<nav className='flex gap-3 mx-6'>
				<NavButton to='.'>Info</NavButton>
				<NavButton to='./reviews'>Reviews</NavButton>
			</nav>

			<Separator className='my-6' />
			<Outlet />
		</Card>
	)
}

export function ErrorBoundary() {
	const error = useRouteError()
	const {gameId} = useParams()
	if (isRouteErrorResponse(error)) {
		return (
			<Alert>
				{error.status === 404
					? `Não foi encontrado jogo '${gameId}'`
					: 'Houve um erro ao carregar esse jogo'}
			</Alert>
		)
	}
	return <div>Houve um erro ao carregar essa página</div>
}
