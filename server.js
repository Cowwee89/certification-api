import express from 'express'

import { 
    getStudents, 
    getStudent, 
    searchStudent,
    createStudent,
    getEvents,
    getEvent,
    createEvent,
    getTestResults,
    getTestResult,
    createTestResult
} from './database.js'
import dotenv from 'dotenv'
import cors from 'cors'

const app = express()
dotenv.config()

app.use(express.json())
app.use(express.static("public"));
app.use(cors());

app.get('/', async (req, res) => {
  res.send('hello world')
})

app.get("/students", async (req, res) => {
    const search_query = req.query.search_query

    if (!search_query) {
        const students = await getStudents()
        res.json(students)
    } else {
        const students = await searchStudent(search_query)
        res.status(201).json(students)
        console.log('fn called')
    }
})

app.get("/students/:id", async (req, res) => {
    const id = req.params.id
    const student = await getStudent(id)
    res.json(student)
})

app.post("/students", async (req, res) => {
    const { sname, birthday } = req.body
    const student = await createStudent(sname, birthday)
    res.status(201).json(student)
})


app.get("/events", async (req, res) => {
    const events = await getEvents()
    res.json(events)
})

app.get("/event/:id", async (req, res) => {
    const id = req.params.id
    const event = await getEvent(id)
    res.json(event)
})

app.post("/events", async (req, res) => {
    const { ename, edate } = req.body
    const event = await createEvent(ename, edate)
    res.status(201).json(event)
})


app.get("/testresults", async (req, res) => {
    const testresults = await getTestResults()
    res.json(testresults)
})

app.get("/testresult/:id", async (req, res) => {
    const id = req.params.id
    const testresult = await getTestResult(id)
    res.json(testresult)
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