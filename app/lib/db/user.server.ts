import {db} from './singleton.server'
import {generateSlug} from 'random-word-slugs'

export async function getUser(id: string) {
	return db.user.findUnique({where: {id}})
}
export async function getUsers(ids: string[]) {
	return db.user.findMany({
		where: {id: {in: ids}},
		select: {id: true, name: true, username: true},
	})
}

export async function getUserByUsername(username: string) {
	return db.user.findUnique({
		where: {username},
	})
}

export async function searchUsers(
	term: string,
	exact: boolean = false,
	followedById: string | undefined = undefined,
	skip: number = 0,
	take: number = 12,
) {
	const search = exact ? {equals: term} : {contains: term}
	const result = await db.user.findMany({
		skip,
		take,
		where: {
			OR: [
				//
				{username: search},
				{name: search},
			],
		},
		select: {
			id: true,
			username: true,
			name: true,
			discordId: true,
			following: followedById
				? {
						select: {followedById: true},
						where: {followedById},
						take: 1,
					}
				: undefined,
		},
	})
	return result.map((r) => ({
		...r,
		following: r.following?.length > 0,
	}))
}

export async function insertMockUser() {
	const username = generateSlug(2, {format: 'kebab'})
	return db.user.create({
		data: {
			username,
			name: username,
			email: `${username}@example.com`,
		},
	})
}

export async function upsertDiscordUser({
	email,
	name,
	discordId,
}: {
	email: string
	name: string
	discordId: string
}) {
	const user = await db.user.findUnique({
		where: {email},
	})

	if (!user) {
		const username = generateSlug(2, {format: 'kebab'})
		return db.user.create({
			data: {email, name, discordId, username},
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				discordId: true,
			},
		})
	} else {
		return db.user.update({
			data: {discordId},
			where: {id: user.id},
			select: selectSession,
		})
	}
}

const selectSession = {
	id: true,
	name: true,
	username: true,
	email: true,
	discordId: true,
} as const

export async function updateUsername({
	username,
	name,
	id,
}: {
	username: string
	name: string
	id: string
}) {
	return db.user.update({
		data: {
			username,
			name,
		},
		where: {id},
	})
}
