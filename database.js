import mysql from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    timezone: 'Z'
}).promise()


/* LOGIN CREDENTIALS */

import jwt from 'jsonwebtoken';

export function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      console.log(err)
  
      if (err) return res.sendStatus(403)
  
      req.user = user
  
      next()
    })
}

/** STUDENT ENDPOINTS */


export async function getStudents() {
    const [rows] = await pool.query("SELECT * FROM student")
    return rows
}

export async function getStudent(id) {
    const [rows] = await pool.query(`
        SELECT *
        FROM student
        WHERE id = ?
    `, [id])
    return rows[0]
}

export async function getStudentByName(string) {
    const [row] = await pool.query(`
        SELECT *
        FROM student
        WHERE sname LIKE ?
    `, [`%${string}%`])
    return row
}

export async function createStudent(sname, birthday) {
    const [result] = await pool.query(`
        INSERT INTO student (sname, birthday)
        VALUES (?, ?)
    `, [sname, birthday])
    const id = result.insertId
    return getStudent(id)
}

async function updateStudentLevel(sid, newLevel, newGrade) {
    await pool.query(`
        UPDATE student
        SET highest_level = ?, best_grade = ?
        WHERE id = ?
    `, [newLevel, newGrade, sid])
}

export async function deleteStudent(id) {
    await pool.query(`
        DELETE FROM test_result
        WHERE student_id = ?
    `, [id])

    await pool.query(`
        DELETE FROM student
        WHERE id = ?
    `, [id])
}


/** EVENT ENDPOINTS */


export async function getEvents() {
    const [rows] = await pool.query("SELECT * FROM event")
    return rows
}

export async function getEvent(id) {
    const [row] = await pool.query(`
        SELECT *
        FROM event
        WHERE id = ?
    `, [id])
    return row[0]
}

export async function getEventsBeforeDate(date) {
    const [row] = await pool.query(`
        SELECT *
        FROM event
        WHERE edate <= ?
    `, [date])
    return row
}

export async function getEventsAfterDate(date) {
    const [row] = await pool.query(`
        SELECT *
        FROM event
        WHERE edate >= ?
    `, [date])
    return row
}

export async function createEvent(ename, edate) {
    const [result] = await pool.query(`
        INSERT INTO event (ename, edate)
        VALUES (?, ?)
    `, [ename, edate])
    const id = result.insertId
    return getEvent(id)
}

export async function deleteEvent(id) {
    await pool.query(`
        DELETE FROM test_result
        WHERE event_id = ?
    `, [id])

    await pool.query(`
        DELETE FROM event
        WHERE id = ?
    `, [id])
}


/** TEST RESULT ENDPOINTS */


export async function getTestResults() {
    const [rows] = await pool.query(`
        SELECT t.id, t.student_id, s.sname, t.event_id, e.ename, t.solve_1, t.solve_2, t.solve_3, t.solve_4, t.solve_5, t.average_of_5, 
        t.level_attempted, t.grade_attempted, t.result, t.name_to_be_printed
        FROM test_result t, student s, event e
        WHERE t.student_id = s.id
        AND t.event_id = e.id`
    )
    return rows
}

export async function getTestResult(id) {
    const [row] = await pool.query(`
        SELECT * FROM test_result WHERE id = ?
    `, [id])
    return row[0]
}

export async function getTestResultsByEvent(eid) {
    const [row] = await pool.query(`
        SELECT t.id, t.student_id, s.sname, t.solve_1, t.solve_2, t.solve_3, t.solve_4, t.solve_5, t.average_of_5, 
        t.level_attempted, t.grade_attempted, t.result, t.name_to_be_printed
        FROM test_result t, student s
        WHERE t.event_id = ?
        AND t.student_id = s.id
    `, [eid])
    return row
}

export async function getTestResultsByStudent(sid) {
    const [row] = await pool.query(`
        SELECT t.id, e.edate, t.event_id, e.ename, t.solve_1, t.solve_2, t.solve_3, t.solve_4, t.solve_5, t.average_of_5, 
        t.level_attempted, t.grade_attempted, t.result, t.name_to_be_printed
        FROM test_result t, event e
        WHERE t.student_id = ?
        AND t.event_id = e.id
    `, [sid])
    return row
}

export async function createTestResult(sid, eid, solve_1, solve_2, solve_3, solve_4, solve_5, average_of_5, 
    level_attempted, grade_attempted, result, name_to_be_printed) {

    const [row] = await pool.query(`
        INSERT INTO test_result (student_id, event_id, solve_1, solve_2, solve_3, solve_4, solve_5, average_of_5, 
            level_attempted, grade_attempted, result, name_to_be_printed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [sid, eid, solve_1, solve_2, solve_3, solve_4, solve_5, average_of_5, 
        level_attempted, grade_attempted, result, name_to_be_printed])
        
    const id = row.insertId

    let current_level
    getStudent(sid)
        .then(data => {
            current_level = data.highest_level
            if (result === "Pass" && (level_attempted > current_level || current_level === undefined)) {
                console.log(current_level)
                pool.query(`
                    UPDATE student
                    SET highest_level = ?, best_grade = ?
                    WHERE id = ?
                `, [level_attempted, grade_attempted, sid])
            }
        })
        .catch(error => {
            console.log(error)
        })    

    return getTestResult(id)
}

export async function deleteTestResult(id) {
    getTestResult(id).then(
        (testResult) => {
            const sid = testResult.student_id
            console.log(sid)
            let maxLevel = 0
            let maxGrade = ''
            getTestResultsByStudent(sid).then((data) => {
                data.forEach((tr) => {
                    if (tr.level_attempted > maxLevel && tr.result === "Pass") {
                        maxLevel = tr.level_attempted
                        maxGrade = tr.grade_attempted
                    }
                })
                if (maxLevel !== 0) updateStudentLevel(sid, maxLevel, maxGrade) 
                else updateStudentLevel(sid, null, '')
            })
        }
    ) 
    await pool.query(`
        DELETE FROM test_result
        WHERE id = ?
    `, [id])
}




