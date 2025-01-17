import express from 'express'

import { 
    getStudents, 
    getStudent, 
    createStudent,
    deleteStudent,
    getEvents,
    getEvent,
    createEvent,
    deleteEvent,
    getTestResults,
    getTestResult,
    createTestResult,
    getStudentByName,
    getTestResultsByEvent,
    getTestResultsByStudent,
    deleteTestResult,
    getEventsBeforeDate,
    getEventsAfterDate,
    generateAccessToken,
    authenticateToken,
} from './database.js'
import dotenv from 'dotenv'
import cors from 'cors'

const app = express()
dotenv.config()

app.use(express.json())
app.use(express.static("public"));
app.use(cors());

app.get('/', async (req, res) => {
  res.status(200).send('hello world')
})


app.get('/login', (req, res) => {
    const token = generateAccessToken({ username: req.body.username });
    res.status(200).json(token);
});


app.post("/students", authenticateToken, async (req, res) => {
    const { sname, birthday } = req.body
    const student = await createStudent(sname, birthday)
    res.status(201).json(student)
})

app.get("/students", authenticateToken, async (req, res) => {
    const sname = req.query.sname

    if (!sname){
        const students = await getStudents()
        res.status(200).json(students)
    } else {
        const students = await getStudentByName(sname)
        res.status(200).json(students)
    }
})

app.get("/students/:id", authenticateToken, async (req, res) => {
    const id = req.params.id
    const student = await getStudent(id)
    res.status(200).json(student)
})

app.delete("/students/:id", authenticateToken, async (req, res) => {
    const id = req.params.id
    await deleteStudent(id)
    res.status(200).send();
})


app.post("/events", authenticateToken, async (req, res) => {
    const { ename, edate } = req.body
    const event = await createEvent(ename, edate)
    res.status(201).json(event)
})

app.get("/events", authenticateToken, async (req, res) => {
    const before = req.query.before
    const after = req.query.after

    if (!before && !after){
        const events = await getEvents()
        res.status(200).json(events)
        console.log('none')
    } else if (!after) {
        const events = await getEventsBeforeDate(before)
        res.status(200).json(events)
        console.log('before')
    } else if (!before) {
        const events = await getEventsAfterDate(after)
        res.status(200).json(events)
        console.log('after')
    }
})

app.get("/events/:id", authenticateToken, async (req, res) => {
    const id = req.params.id
    const event = await getEvent(id)
    res.status(200).json(event)
})

app.delete("/events/:id", authenticateToken, async (req, res) => {
    const id = req.params.id
    await deleteEvent(id)
    res.status(200).send();
})


app.post("/testresults", authenticateToken, async (req, res) => {
    const { student_id, event_id, solve_1, solve_2, solve_3, solve_4, solve_5, average_of_5, 
        level_attempted, grade_attempted, result, name_to_be_printed } = req.body

    const testresults = await createTestResult(student_id, event_id, solve_1, solve_2, solve_3, solve_4, solve_5, average_of_5, 
        level_attempted, grade_attempted, result, name_to_be_printed)
    res.status(201).json(testresults)
})

app.get("/testresults", authenticateToken, async (req, res) => {
    const eid = req.query.eid
    const sid = req.query.sid

    if (!eid && !sid) {
        const testResults = await getTestResults()
        res.status(200).json(testResults)
    } else if (!sid) {
        const testResults = await getTestResultsByEvent(eid)
        res.status(200).json(testResults)
    } else if (!eid) {
        const testResults = await getTestResultsByStudent(sid)
        res.status(200).json(testResults)
    }
})

app.get("/testresults/:id", authenticateToken, async (req, res) => {
    const id = req.params.id
    const testresult = await getTestResult(id)
    res.status(200).json(testresult)
})

app.delete("/testresults/:id", authenticateToken, async (req, res) => {
    const id = req.params.id
    await deleteTestResult(id)
    res.status(200).send()
})


app.use((err, req, res, next) => {
    console.log("error occured")
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})