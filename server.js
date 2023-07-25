import express from 'express'

import { 
    getStudents, 
    getStudent, 
    createStudent,
    getEvents,
    getEvent,
    createEvent,
    getTestResults,
    getTestResult,
    createTestResult,
    getStudentByName,
    getTestResultsByEvent
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

app.get("/students", async (req, res) => {
    const sname = req.query.sname

    if (!sname){
        const students = await getStudents()
        res.status(200).json(students)
    } else {
        const students = await getStudentByName(sname)
        res.status(200).json(students)
    }
})

app.get("/students/:id", async (req, res) => {
    const id = req.params.id
    const student = await getStudent(id)
    res.status(200).json(student)
})

app.post("/students", async (req, res) => {
    const { sname, birthday } = req.body
    const student = await createStudent(sname, birthday)
    res.status(201).json(student)
})


app.get("/events", async (req, res) => {
    const events = await getEvents()
    res.status(200).json(events)
})

app.get("/event/:id", async (req, res) => {
    const id = req.params.id
    const event = await getEvent(id)
    res.status(200).json(event)
})

app.post("/events", async (req, res) => {
    const { ename, edate } = req.body
    const event = await createEvent(ename, edate)
    res.status(201).json(event)
})


app.get("/testresults", async (req, res) => {
    const eid = req.query.eid

    if (!eid) {
        const testResults = await getTestResults()
        res.status(200).json(testResults)
    } else {
        const testResults = await getTestResultsByEvent(eid)
        res.status(200).json(testResults)
    }    
})

app.get("/testresult/:id", async (req, res) => {
    const id = req.params.id
    const testresult = await getTestResult(id)
    res.status(200).json(testresult)
})

app.post("/testresults", async (req, res) => {
    const { student_id, event_id, solve_1, solve_2, solve_3, solve_4, solve_5, average_of_5, 
        level_attempted, level_achieved, grade_achieved, name_to_be_printed } = req.body

    const testresults = await createTestResult(student_id, event_id, solve_1, solve_2, solve_3, solve_4, solve_5, average_of_5, 
        level_attempted, level_achieved, grade_achieved, name_to_be_printed)
    res.status(201).json(testresults)
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