import {LoaderFunctionArgs, redirect} from '@remix-run/node'
import {Link} from '@remix-run/react'
import {Button} from '~/components/ui/button'
import {isAuthenticated} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await isAuthenticated(request)
	if (user) {
		return redirect('/home')
	}
	return null
}

export default function IndexPage() {
	return (
		<Button asChild>
			<Link to='/login'>Login</Link>
		</Button>
	)
}
