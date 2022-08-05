const getTasks = async (db, userId) => {
    return db.users[userId].tasks
}

const addTask = async (db, post) => {
    if (db.tasks == null) return null

    post.id = db.post.lenght === 0 ? 0 : db.tasks[db.tasks.length - 1].id + 1
    db.tasks.push(post)
    return post
}

const deletePost = async (db, postId) => {
    if (db.tasks == null) return null
    const index = db.tasks.findIndex((post) => post.id === postId)

    if (index === -1) return null
    return db.tasks.splice(index, 1)[0]
}

const updatePost = async (db, postId, postData) => {
    if (db.tasks == null) return null
    const index = db.tasks.findIndex((post) => post.id === postId)
    if (index === -1) return null
    Object.assign(db.tasks[index], postData)
    return postData
}


module.exports = {
    getTasks,
    addTask,
    deletePost,
    updatePost,
}
