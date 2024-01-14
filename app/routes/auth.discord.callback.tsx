import {LoaderFunctionArgs} from '@remix-run/node'
import {callbackDiscord} from '~/lib/login/auth.server'
import {consumeFromSession} from '~/lib/login/session.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const redirectTo = await consumeFromSession(
		request,
		'redirectTo',
	)

	return callbackDiscord(request, redirectTo)
}
