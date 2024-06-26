import {
	LoaderFunctionArgs,
	MetaFunction,
	json,
} from '@remix-run/node'
import {
	Link,
	isRouteErrorResponse,
	useLoaderData,
	useRouteError,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {ScoreDisplay} from '~/components/ScoreDisplay'
import {GameLink} from '~/components/GameLink'
import {Quote} from '~/components/QuoteReview'
import {Alert} from '~/components/ui/alert'
import {Button} from '~/components/ui/button'
import {TooltipProvider} from '~/components/ui/tooltip'
import {type BggBoardgame, getGameId} from '~/lib/bgg'
import {getReviewByUserGame} from '~/lib/db/review.server'
import {getUserByUsername} from '~/lib/db/user.server'

export const meta: MetaFunction<typeof loader> = ({
	params,
	data,
}) => {
	const title = `Review de ${data?.game.name} por ${data?.pageUser.name} | BGP`
	const image = data?.game.image
	const description =
		data?.review && data.review.length <= 200
			? data?.review
			: `${data?.review?.slice(0, 197)}...`
	const permalink = `https://boardgameplanilha.xyz/user/${params.username}/review/${params.gameId}`
	return [
		{title},
		{property: 'description', content: description},

		{property: 'og:title', content: title},
		{property: 'og:description', content: description},
		{property: 'og:type', content: 'article'},
		{property: 'og:image', content: image},
		{property: 'og:url', content: permalink},
	]
}

export async function loader({params}: LoaderFunctionArgs) {
	invariant(params.username, 'Expected username')
	invariant(params.gameId, 'Expected gameId')

	const pageUser = await getUserByUsername(params.username)

	if (pageUser == null) {
		throw new Response('Usuário não encontrado', {
			status: 404,
		})
	}

	const [score, game] = await Promise.all([
		getReviewByUserGame({
			userId: pageUser.id,
			gameId: params.gameId,
		}),
		getGameId(params.gameId),
	])

	if (!score) {
		throw new Response('Nota não encontrada', {status: 404})
	}

	return json({
		score: score.value,
		review: score.review,
		game,
		pageUser,
	})
}

export default function UserGameReviewPage() {
	const {game, score, review, pageUser} =
		useLoaderData<typeof loader>()
	return (
		<>
			<div className='mx-auto mt-6 min-w-[300px] max-w-[60ch] flex flex-col gap-6'>
				<div className='flex gap-2 justify-between'>
					<GameLink game={game as BggBoardgame} />
					<TooltipProvider>
						<ScoreDisplay score={score} />
					</TooltipProvider>
				</div>
				{review && (
					<Quote quote={review} author={pageUser.name} />
				)}
			</div>
			<Button
				asChild
				variant='link'
				className='mx-auto h-auto whitespace-break-spaces text-center'
			>
				<Link to={`/game/${game.id}/reviews`}>
					Faça sua análise de {game.name} também
				</Link>
			</Button>
		</>
	)
}

export function ErrorBoundary() {
	const error = useRouteError()
	console.log(error)

	if (isRouteErrorResponse(error)) {
		return <Alert variant='destructive'>{error.data}</Alert>
	}

	return (
		<Alert>Ops! Houve um erro ao carregar a página!</Alert>
	)
}
