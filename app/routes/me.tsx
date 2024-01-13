import {LoaderFunctionArgs, json} from '@remix-run/node'
import {getReviews} from '~/lib/db/review.server'
import {getScores} from '~/lib/db/score.server'
import {isAuthenticated} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await isAuthenticated(request)
	if (typeof user?.email !== 'string') {
		throw new Response('Unprocessable Entity', {
			status: 422,
		})
	}
	const reviews = await getReviews({userEmail: user.email})
	const scores = await getScores({userEmail: user.email})
	return json({scores, reviews})
}
