import fastify from "fastify";
import cookie from '@fastify/cookie'

import {usersRoutes} from "./routes/users"

export const app = fastify()

app.register(cookie)

app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method} ${request.url}]`)
})

app.register(usersRoutes, {
    prefix: 'users'
})

app.get('/hello', () => {
    return 'Hello World'
})