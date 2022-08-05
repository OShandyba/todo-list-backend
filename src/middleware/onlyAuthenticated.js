function onlyAuthorizedMiddleware(ctx, next) {
    if (ctx.session.userId) {
        next()
    } else {
        ctx.response.send({
            error: 'Unauthorized',
        }, 401)
    }
}

module.exports = onlyAuthorizedMiddleware