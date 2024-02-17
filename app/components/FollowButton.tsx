import {useFetcher} from '@remix-run/react'
import {Button} from './ui/button'
import {UserMinusIcon, UserPlusIcon} from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from './ui/tooltip'

interface RelationFormProps {
	username: string
	following: boolean
}

export function FollowButton({
	username,
	following,
}: RelationFormProps) {
	const relationFetcher = useFetcher()
	const optimisticFollowing = (() => {
		const optimisticIntent =
			relationFetcher.formData?.get('intent')
		if (optimisticIntent === 'follow') {
			return true
		} else if (optimisticIntent === 'unfollow') {
			return false
		}
		return following
	})()

	return (
		<relationFetcher.Form
			method='POST'
			action={`/user/${username}`}
		>
			<input
				type='hidden'
				name='intent'
				value={optimisticFollowing ? 'unfollow' : 'follow'}
			/>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						disabled={optimisticFollowing !== following}
						variant={
							optimisticFollowing
								? 'destructive'
								: 'default'
						}
					>
						{optimisticFollowing ? (
							<UserMinusIcon size='1em' />
						) : (
							<UserPlusIcon size='1em' />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{optimisticFollowing
						? 'Deixar de seguir'
						: 'Seguir'}
				</TooltipContent>
			</Tooltip>
		</relationFetcher.Form>
	)
}
