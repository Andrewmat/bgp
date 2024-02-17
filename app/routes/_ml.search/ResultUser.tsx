import {Link} from '@remix-run/react'
import {FollowButton} from '~/components/FollowButton'
import {buttonVariants} from '~/components/ui/button'
import {Card, CardTitle} from '~/components/ui/card'
import {cn} from '~/lib/utils'

export function ResultUser({
	user,
	sessionUserId,
}: {
	user: {
		id: string
		username: string
		name: string
		following: boolean
	}
	sessionUserId?: string
}) {
	return (
		<Card className='p-5 flex justify-between'>
			<Link
				to={`/user/${user.username}`}
				className={cn(
					buttonVariants({variant: 'link'}),
					'inline-flex flex-col items-start gap-1',
				)}
			>
				<CardTitle>{user.name} </CardTitle>
				<small className='text-muted-foreground decoration-muted-foreground'>
					(@{user.username})
				</small>
			</Link>
			{sessionUserId && user.id !== sessionUserId && (
				<FollowButton
					username={user.username}
					following={user.following}
				/>
			)}
		</Card>
	)
}
