import { app } from './app'
import {env} from './env'

const port = env.PORT ?? 3000
const host = '0.0.0.0'

app.listen({ port, host })
   .then(() => {
     console.log(`HTTP Server Running on http://${host}:${port}`)
   })
   .catch(err => {
     console.error(err)
     process.exit(1)
   })