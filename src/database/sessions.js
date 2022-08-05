const addSession = async (db, session) => {
    if (db.sessions == null) return null
    db.sessions.push(session)
    return session

}

const getSession = async (db, sessionId) => {
    if (db.sessions == null) return null
    return db.sessions.find(session => session.id === sessionId)
}

const deleteSession = async (db, sessionId) => {
    if (db.sessions == null) return null
    const index = db.sessions.findIndex((session) => session.id === sessionId)
    if (index === -1) return null
    return db.sessions.splice(index, 1)[0]
}

const updateSession = async (db, sessionId, sessionData) => {
    if (db.sessionss == null) return null
    const index = db.sessions.findIndex((session) => session.id === sessionId)
    if (index === -1) return null
    Object.assign(db.sessions[index], sessionData)
    return session
}

module.exports = {
    addSession,
    getSession,
    deleteSession,
    updateSession,
}