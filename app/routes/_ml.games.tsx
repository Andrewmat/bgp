import {LoaderFunctionArgs} from '@remix-run/node'
import {
	NavLink,
	NavLinkProps,
	Outlet,
} from '@remix-run/react'
import {Card} from '~/components/ui/card'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {cn} from '~/lib/utils'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	await assertAuthenticated(request)
	return null
}

export default function GamesPage() {
	return (
		<div className='full-bleed px-8 lg:px-10 lg:mx-auto lg:max-w-[1600px]'>
			<Card className='flex flex-col lg:flex-row min-h-full'>
				<nav className='flex [&>*]:flex-1 lg:[&>*]:flex-initial lg:flex-col lg:w-[220px]'>
					<GameNavLink to='/games/voted'>
						Jogos votados
					</GameNavLink>
					<GameNavLink to='/games/bookmarked'>
						Jogos salvos
					</GameNavLink>
				</nav>
				<div className='flex-1 p-6'>
					<Outlet />
				</div>
			</Card>
		</div>
	)
}

function GameNavLink({className, ...props}: NavLinkProps) {
	return (
		<NavLink
			className={(classNameProps) =>
				cn(
					'p-3 flex items-center hover:bg-secondary hover:text-secondary-foreground focus-visible:text-secondary-foreground first:rounded-ss-md border-l-4 border-transparent',
					classNameProps.isActive &&
						'bg-accent text-accent-foreground font-bold border-l-secondary-foreground',
					classNameProps.isPending && 'opacity-60',
					typeof className === 'function'
						? className(classNameProps)
						: className,
				)
			}
			{...props}
		/>
	)
}
