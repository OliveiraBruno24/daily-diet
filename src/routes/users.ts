import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from 'zod'
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
    app.get(
        '/',
        {//preHandler === middleware
          preHandler: [checkSessionIdExists],
        },
        async (request) => {
          const { sessionId } = request.cookies
    
          const users = await knex('users')
            .where('session_id', sessionId)
            .select()
    
          return { users }
        },
      )

      app.get(
        '/summary',
        {
          preHandler: [checkSessionIdExists],
        },
        async (request) => {
          const { sessionId } = request.cookies
    
          const summary = await knex('users')
            .where('session_id', sessionId)
            .sum('amount', { as: 'amount' })
            .first()
    
          return { summary }
        },
      )
    
      app.post('/', async (request, reply) => {
        const createUserBodySchema = z.object({
          name: z.string(),
          age: z.number(),
          sex:z.enum(['male', 'female'])
         
        })
    
        const { name, age, sex } = createUserBodySchema.parse(
          request.body,
        )
    
        let sessionId = request.cookies.sessionId
    
        if (!sessionId) {
          sessionId = randomUUID()
    
          reply.setCookie('sessionId', sessionId, {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          })
        }
    
        await knex('users').insert({
          id: randomUUID(),
          name,
          age,
          sex,
          session_id: sessionId,
        })
    
        return reply.status(201).send()
      })

      app.get(
        '/:id',
        {
          preHandler: [checkSessionIdExists],
        },
        async (request) => {
          const getUsersParamsSchema = z.object({
            id: z.string().uuid(),
          })
    
          const { id } = getUsersParamsSchema.parse(request.params)
    
          const { sessionId } = request.cookies
    
    
    
    
          const user = await knex('users')
            .where({
              session_id: sessionId,
              id,
            })
            .first()
    
          return {
            user,
          }
        },
      )
    }
