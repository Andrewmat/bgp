import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
	redirect,
} from '@remix-run/node'
import invariant from 'tiny-invariant'
import {
	bookmark,
	ignore,
	unbookmark,
	unignore,
} from '~/lib/db/gameuser.server'
import {assertAuthenticated} from '~/lib/login/auth.server'

export async function loader({params}: LoaderFunctionArgs) {
	return redirect(`/game/${params.gameId}`)
}

export async function action({
	params,
	request,
}: ActionFunctionArgs) {
	invariant(params.gameId, 'Game id is required')
	const user = await assertAuthenticated(request)

	const formData = await request.formData()
	const intent = formData.get('intent')
	const convertToResponse = (result: {
		bookmarked: boolean
		ignored: boolean
	}) => {
		return json({
			bookmarked: result.bookmarked,
			ignored: result.ignored,
		})
	}
	if (intent === 'ignore') {
		const value = formData.get('value')
		if (value === 'true') {
			return convertToResponse(
				await ignore({
					userId: user.id,
					gameId: params.gameId,
				}),
			)
		} else if (value === 'false') {
			return convertToResponse(
				await unignore({
					userId: user.id,
					gameId: params.gameId,
				}),
			)
		} else {
			throw new Response(
				'Value should be set to true or false',
				{status: 422},
			)
		}
	} else if (intent === 'bookmark') {
		const value = formData.get('value')
		if (value === 'true') {
			return convertToResponse(
				await bookmark({
					userId: user.id,
					gameId: params.gameId,
				}),
			)
		} else if (value === 'false') {
			return convertToResponse(
				await unbookmark({
					userId: user.id,
					gameId: params.gameId,
				}),
			)
		} else {
			throw new Response(
				'Value should be set to true or false',
				{status: 422},
			)
		}
	} else {
		throw new Response(
			`Intent ${intent} is not recognized`,
			{status: 422},
		)
	}
}
