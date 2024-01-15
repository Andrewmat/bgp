import {LoaderFunctionArgs} from '@remix-run/node'
import {callbackDiscord} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	return callbackDiscord(request)
}
