import {LoaderFunctionArgs, redirect} from '@remix-run/node'
import {assertAuthenticated} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const sessionUser = await assertAuthenticated(request)

	return redirect(`/user/${sessionUser.username}`)
}
