import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {GameLink} from '~/components/GameLink'
import {Quote} from '~/components/QuoteReview'
import {BggBoardgame} from '~/lib/bgg'
import {getReviewsByUser} from '~/lib/db/review.server'
import {getCompleteScoreGame} from '~/lib/db/score.server'
import {getUserByUsername} from '~/lib/db/user.server'

export async function loader({params}: LoaderFunctionArgs) {
	invariant(params.username, 'Expected username')
	const pageUser = await getUserByUsername(params.username)
	if (pageUser == null) {
		throw new Response('User not found', {status: 404})
	}
	const rs = await getReviewsByUser({
		userId: pageUser.id,
	})

	const reviews = await getCompleteScoreGame(rs)

	return json({reviews})
}

export default function UserReviewsPage() {
	const {reviews} = useLoaderData<typeof loader>()

	return (
		<div className='mx-auto'>
			<ul className='mx-6 flex flex-col gap-12 max-w-[60ch]'>
				{reviews.map(({game, score}) => (
					<li key={game.id}>
						<Quote
							quote={score.review}
							author={
								<GameLink
									game={game as BggBoardgame}
									className='inline-flex'
								/>
							}
						/>
					</li>
				))}
			</ul>
		</div>
	)
}
