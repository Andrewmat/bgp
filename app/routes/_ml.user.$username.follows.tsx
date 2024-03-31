import {LoaderFunctionArgs, json} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {FollowButton} from '~/components/FollowButton'
import {buttonVariants} from '~/components/ui/button'
import {Card, CardTitle} from '~/components/ui/card'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/ui/tabs'
import {TooltipProvider} from '~/components/ui/tooltip'
import {
	getFollowers,
	getFollowing,
} from '~/lib/db/follow.server'
import {getUserByUsername} from '~/lib/db/user.server'
import {cn} from '~/lib/utils'

export async function loader({params}: LoaderFunctionArgs) {
	invariant(params.username, 'Username is required')
	const userFromPage = await getUserByUsername(
		params.username,
	)

	if (!userFromPage) {
		throw new Response('Not Found', {status: 404})
	}

	const followers = await getFollowers({
		followingId: userFromPage.id,
	})
	const following = await getFollowing({
		followedById: userFromPage.id,
	})

	return json({following, followers})
}

export default function FollowersUserPage() {
	const {followers, following} =
		useLoaderData<typeof loader>()
	return (
		<TooltipProvider>
			<Tabs defaultValue='followers'>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='followers'>
						Followers
					</TabsTrigger>
					<TabsTrigger value='following'>
						Following
					</TabsTrigger>
				</TabsList>
				<TabsContent value='followers'>
					<div className='flex flex-col gap-2'>
						{followers.map((follower) => (
							<UserCard
								key={follower.id}
								user={{...follower, following: true}}
							/>
						))}
					</div>
				</TabsContent>
				<TabsContent value='following'>
					<div className='flex flex-col gap-2'>
						{following.map((follow) => (
							<UserCard
								key={follow.id}
								user={{...follow, following: true}}
							/>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</TooltipProvider>
	)
}

export function UserCard({
	user,
}: {
	user: {
		id: string
		username: string
		name: string
		following: boolean
	}
}) {
	return (
		<Card className='p-5 flex justify-between'>
			<Link
				to={`/user/${user.username}`}
				className={cn(
					buttonVariants({variant: 'link'}),
					'inline-flex flex-col items-start gap-1 h-auto',
				)}
			>
				<CardTitle className='whitespace-break-spaces'>
					{user.name}
				</CardTitle>
				<small className='text-muted-foreground decoration-muted-foreground'>
					(@{user.username})
				</small>
			</Link>
		</Card>
	)
}
