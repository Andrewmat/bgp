import {LoaderFunctionArgs} from '@remix-run/node'
import {NavLink, Outlet} from '@remix-run/react'
import {assertAuthenticated} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	if (!adminEmails.includes(user.email)) {
		console.log('NOT ADMIN', user.email)
		throw new Response('Not Found', {status: 404})
	}

	return null
}

export default function AdminPage() {
	return (
		<div className='flex flex-col md:flex-row'>
			<nav className='flex-1 flex flex-col gap-3'>
				<NavLink to='./games'>Games</NavLink>
				<NavLink to='./users'>Users</NavLink>
				<NavLink to='/'>Sair</NavLink>
			</nav>
			<main className='flex-[4]'>
				<Outlet />
			</main>
		</div>
	)
}

export const adminEmails = ['andre.m.santos1@gmail.com']
