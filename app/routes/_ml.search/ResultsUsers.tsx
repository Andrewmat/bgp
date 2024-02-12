import {Link} from '@remix-run/react'
import {Card} from '~/components/ui/card'
import {cn} from '~/lib/utils'

export function ResultsUsers({
	results,
}: {
	results: {
		id: string
		username: string
		name: string
		discordId: string | null
	}[]
}) {
	return (
		<div>
			<h1 className='mb-2'>Users ({results.length})</h1>
			<ul className='grid grid-cols-3 gap-2 self-start'>
				{results.map((user) => (
					<li key={user.id}>
						<Link
							to={`/user/${user.username}`}
							className={cn(
								'[&>*]:hover:bg-accent',
								'[&>*]:hover:text-accent-foreground',
								'[&>*]:focus-visible:bg-accent',
								'[&>*]:focus-visible:text-accent-foreground',
							)}
						>
							<Card className='p-5 h-full'>
								{user.name} (
								<em>
									<small>@{user.username}</small>
								</em>
								)
							</Card>
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
