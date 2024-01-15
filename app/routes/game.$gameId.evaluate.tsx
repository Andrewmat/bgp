import {
	LoaderFunctionArgs,
	json,
	redirect,
} from '@remix-run/node'
import {
	deleteScore,
	upsertScore,
} from '~/lib/db/score.server'
import {getUser} from '~/lib/login/auth.server'
import {SessionUser} from '~/lib/login/user.schema'

export async function loader() {
	return redirect('/home')
}

export async function action({
	request,
	params,
}: LoaderFunctionArgs) {
	const user = await getUser(request)
	if (!user || typeof user.email !== 'string') {
		throw new Response('Unauthorized', {
			status: 401,
		})
	}
	const evaluationForm = await request.formData()
	const gameId = params.gameId

	switch (evaluationForm.get('method')) {
		case 'delete': {
			methodDelete({user, gameId})
			return null
		}
		default: {
			const score = evaluationForm.get('score')
			return json(methodPost({user, gameId, score}))
		}
	}
}

async function methodPost({
	user,
	gameId,
	score,
}: {
	user: SessionUser
	gameId: unknown
	score: unknown
}) {
	if (
		typeof gameId !== 'string' ||
		typeof score !== 'string' ||
		isNaN(Number(score))
	) {
		throw new Response('Unprocessable Entity', {
			status: 422,
		})
	}
	const newScore = await upsertScore({
		userEmail: user.email,
		gameId: gameId,
		value: Number(score),
	})
	return newScore
}

async function methodDelete({
	user,
	gameId,
}: {
	user: SessionUser
	gameId: unknown
}) {
	if (typeof gameId !== 'string') {
		throw new Response('Unprocessable Entity', {
			status: 422,
		})
	}

	await deleteScore({userEmail: user.email, gameId: gameId})
}
