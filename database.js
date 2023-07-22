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


export async function getStudents() {
    const [rows] = await pool.query("SELECT * FROM student")
    return rows
}

export async function getStudent(id) {
    const [row] = await pool.query(`
        SELECT *
        FROM student
        WHERE id = ?
    `, [id])
    return row[0]
}

export async function searchStudent(string) {
    const [row] = await pool.query(`
        SELECT *
        FROM student
        WHERE sname LIKE ?
    `, [`%${string}%`])
    console.log('hi again')
    return row[0]
}

export async function createStudent(sname, birthday) {
    const [result] = await pool.query(`
        INSERT INTO student (sname, birthday)
        VALUES (?, ?)
    `, [sname, birthday])
    const id = result.insertId
    return getStudent(id)
}


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

export async function createEvent(ename, edate) {
    const [result] = await pool.query(`
        INSERT INTO event (ename, edate)
        VALUES (?, ?)
    `, [ename, edate])
    const id = result.insertId
    return getEvent(id)
}


export async function getTestResults() {
    const [rows] = await pool.query('SELECT * FROM test_result')
    return rows
}

export async function getTestResult(id) {
    const [row] = await pool.query(`
        SELECT *
        FROM test_result
        WHERE id = ?
    `, [id])
    return row[0]
}

export async function createTestResult(sid, eid, solve_1, solve_2, solve_3, solve_4, solve_5, average_of_5, 
    level_attempted, level_achieved, grade_achieved, name_to_be_printed) {

    const [result] = await pool.query(`
        INSERT INTO test_result (student_id, event_id, solve_1, solve_2, solve_3, solve_4, solve_5, average_of_5, 
            level_attempted, level_achieved, grade_achieved, name_to_be_printed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [sid, eid, solve_1, solve_2, solve_3, solve_4, solve_5, average_of_5, 
        level_attempted, level_achieved, grade_achieved, name_to_be_printed])
        
    const id = result.insertId

    let current_level
    getStudent(1)
        .then(data => {
            current_level = data.highest_level
            console.log(current_level)
            if (level_achieved > current_level || current_level === undefined) {
                pool.query(`
                    UPDATE student
                    SET highest_level = ?, best_grade = ?
                    WHERE id = ?
                `, [level_achieved, grade_achieved, sid])
            }
        })
        .catch(error => {
            console.log(error)
        })
    console.log('asdf')
    console.log(current_level)

    

    return getTestResult(id)
}