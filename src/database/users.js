const { v4: generateID } = require('uuid')

const getUser = async (db, userId) => {
    if (db.users == null) return null
    return db.users[userId]
}

const getUsers = async (db) => {
    return db.users
}

const addUser = async (db, user) => {
    if (db.users == null) return null
    user.id = generateID()
    user.tasks = {}
    db.users[user.id] = user
    return user
}

const deleteUser = async (db, userId) => {
    if (db.users == null) return null

    delete db.users[userId]

    return true
}

const updateUser = async (db, userId, userData) => {
    if (db.users == null || db.users[userId] == null) return null

    const user = Object.assign(db.users[userId], userData)

    return user
}

const getUserByCredentials = async (db, login, password) => {
    if (db.users == null) return null
    return Object.values(db.users).find(user => user.username === login && user.password === password)
}

module.exports = {
    getUser,
    getUsers,
    addUser,
    deleteUser,
    updateUser,
    getUserByCredentials,
}
