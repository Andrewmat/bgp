import invariant from 'tiny-invariant'

invariant(process.env.HOST_URL, 'HOST_URL should be set')

export const HOST_URL = process.env.HOST_URL
