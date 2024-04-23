import {LoaderFunctionArgs, redirect} from '@remix-run/node'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {adminEmails} from './admin'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	if (!adminEmails.includes(user.email)) {
		console.log('NOT ADMIN', user.email)
		throw new Response('Not Found', {status: 404})
	}

	return redirect('./games')
}
