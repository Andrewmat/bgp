import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	json,
	useFetcher,
	useLoaderData,
} from '@remix-run/react'
import {Button} from '~/components/ui/button'
import {Input} from '~/components/ui/input'
import {ExternalLink, Star} from 'lucide-react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {BggSearchResult, searchGames} from '~/lib/bgg'
import {useReducer, useState} from 'react'
import {cn} from '~/lib/utils'
import {db} from '~/lib/db/singleton.server'
import {Avatar, AvatarImage} from '~/components/ui/avatar'
import {isAuthenticated} from '~/lib/login/auth.server'

export const meta: MetaFunction = () => {
	return [
		{title: 'BGP | Board Game Planilha'},
		{
			name: 'description',
			content: 'Procure e revise board games!',
		},
	]
}

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const term = new URL(request.url).searchParams.get('q')
	let results: BggSearchResult[] | null = null
	if (typeof term === 'string')
		results = await searchGames(term)

	const user = await isAuthenticated(request)

	return json({
		term,
		results,
		userId: user?.id,
		username: user?.name,
		userImage: user?.profileImage,
	})
}

export default function IndexPage() {
	const {results, term, userId, userImage, username} =
		useLoaderData<typeof loader>()

	return (
		<>
			<header className='flex w-full p-4'>
				<div className='flex-grow'>
					<h1>Board Game Planilha</h1>
				</div>
				<div>
					<Avatar>
						<AvatarImage src={userImage} />
					</Avatar>
					<h2>{username}</h2>
					<Form method='POST' action='/logout'>
						<Button variant='link'>Logout</Button>
					</Form>
				</div>
			</header>
			<div className='container my-4'>
				<Form method='GET' className='flex w-full gap-2'>
					<Input
						name='q'
						type='search'
						defaultValue={term ?? undefined}
					/>
					<Button type='submit'>Search</Button>
				</Form>
				{results && (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{results.map((game) => (
								<TableItem game={game} key={game.id} />
							))}
						</TableBody>
					</Table>
				)}
			</div>
		</>
	)
}

function TableItem({game}: {game: BggSearchResult}) {
	return (
		<>
			<TableRow>
				<TableCell>
					{game.name} <small>({game.yearPublished})</small>
				</TableCell>
				<TableCell>
					<Button asChild>
						<Link to={`/game/${game.id}`}>Detalhes</Link>
					</Button>
					<Link
						to={`https://boardgamegeek.com/boardgame/${game.id}`}
						target='_blank'
						rel='noreferrer'
						onClick={(e) => e.stopPropagation()}
					>
						<ExternalLink size='1em' />
					</Link>
				</TableCell>
			</TableRow>
		</>
	)
}
