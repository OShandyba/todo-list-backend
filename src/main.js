const RestLib = require('rest-library');
const { parseBodyMiddleware } = require('rest-library/utils.js')

const parseCookieMiddleware = require('./middleware/parseCookie.js')
const onlyAuthenticatedMiddleware = require('./middleware/onlyAuthenticated.js')
const authenticateMiddleware = require('./middleware/authenticate.js')
const sessionMiddleware = require('./middleware/session.js')

const connect = require('./database/connect.js')
const { addUser, getUserByCredentials } = require('./database/users.js')
const crypto = require('node:crypto');
const { deleteSession } = require('./database/sessions.js');
const app = new RestLib()

app.error((ctx, error) => {
    console.error(error)

    ctx.response.send({
        error: error.message,
    }, 500)
})

app.use((ctx, next) => {
    ctx.response.setHeader('Access-Control-Allow-Origin', ['http://localhost:3000'])
    ctx.response.setHeader('Access-Control-Allow-Headers', ['content-type'])
    ctx.response.setHeader('Access-Control-Allow-Credentials', 'true')
    ctx.response.setHeader('Access-Control-Allow-Methods', ['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'])
    next()
})
app.use(parseBodyMiddleware)
app.use((ctx, next) => {
    console.log(`${ctx.request.method}: ${ctx.request.url}`)
    if (ctx.request.body != null) {
        console.log(ctx.request.body, '\n')
    } else {
        console.log()
    }

    next()
})
app.use(parseCookieMiddleware)
app.use(sessionMiddleware)

/**
 * ----------- AUTHENTICATION -----------
 */

async function userBodyValidation(ctx, next) {
    const { body } = ctx.request
    if (body.username == null || body.password == null) {
        ctx.response.send({
            error: 'Invalid body',
        }, 400)
        return
    }

    ctx.userBody = body
    next()
}
app.post('/registration', userBodyValidation, async (ctx) => {
    const db = await connect()

    const user = await addUser(db, ctx.userBody)
    ctx.session.userId = user.id

    ctx.response.send(user)
})

app.post('/login', userBodyValidation, async (ctx) => {
    const db = await connect()
    const user = await getUserByCredentials(db, ctx.userBody.username, ctx.userBody.password)

    if (user) {
        ctx.session.userId = user.id
        ctx.response.send(user)
    } else {
        ctx.response.send({
            error: 'Invalid user data',
        }, 401)
    }
})

app.post('/logout', async (ctx) => {
    const db = await connect()
    await deleteSession(db, ctx.session.id)
    ctx.response.send({
        message: 'Logout successful',
    })
})

app.get('/user', onlyAuthenticatedMiddleware, authenticateMiddleware, (ctx) => {
    ctx.response.send({ id: ctx.user.id, username: ctx.user.username })
})

/**
 * ----------- END AUTHENTICATION -----------
 */

/**
 * ----------- POSTS -----------
 */

app.get('/tasks', onlyAuthenticatedMiddleware, authenticateMiddleware, async (ctx) => {
    ctx.response.send(Object.values(ctx.user.tasks))
})

app.post('/task', onlyAuthenticatedMiddleware, authenticateMiddleware, async (ctx) => {
    const task = {
        id: crypto.randomUUID(),
        title: ctx.request.body.title,
    }
    ctx.user.tasks[task.id] = task

    ctx.response.send(task)
})

app.patch('/task/:id', onlyAuthenticatedMiddleware, authenticateMiddleware, async (ctx) => {
    const task = ctx.user.tasks[ctx.request.params.id]
    Object.assign(task, ctx.request.body)
    ctx.response.send(task)
})


app.delete('/task/:id', onlyAuthenticatedMiddleware, authenticateMiddleware, async (ctx) => {
    const task = ctx.user.tasks[ctx.request.params.id]
    delete ctx.user.tasks[ctx.request.params.id]
    ctx.response.send(task)
})

app.delete('/tasks', onlyAuthenticatedMiddleware, authenticateMiddleware, async (ctx) => {
    ctx.user.tasks = {}
    ctx.response.send(task)
})

/**
 * ----------- END POSTS -----------
 */

app.listen(3001, () => {
    console.log('Server is running on port http://localhost:3001');
})
