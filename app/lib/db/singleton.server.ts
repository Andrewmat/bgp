import {PrismaClient} from '@prisma/client'

const singleton = <Value>(
	name: string,
	valueFactory: () => Value,
): Value => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const g = global as any
	g.__singletons ??= {}
	g.__singletons[name] ??= valueFactory()
	return g.__singletons[name]
}

export const db = singleton(
	'prisma',
	() => new PrismaClient(),
)
