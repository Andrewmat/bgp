import {db} from './singleton.server'

export function followUser({
	followedById,
	followingId,
}: {
	followedById: string
	followingId: string
}) {
	return db.follows.create({
		data: {
			followingId,
			followedById,
		},
	})
}

export function unfollowUser({
	followedById,
	followingId,
}: {
	followedById: string
	followingId: string
}) {
	return db.follows.delete({
		where: {
			followingId_followedById: {
				followingId,
				followedById,
			},
		},
	})
}

export async function getIsFollowing({
	followedById,
	followingId,
}: {
	followedById: string
	followingId: string
}) {
	const result = await db.follows.findUnique({
		where: {
			followingId_followedById: {
				followedById,
				followingId,
			},
		},
	})
	return Boolean(result)
}

export async function getFollowing({
	followedById,
}: {
	followedById: string
}) {
	const result = await db.follows.findMany({
		where: {
			followedById,
		},
		select: {
			following: true,
		},
	})
	return result.map((r) => r.following)
}
