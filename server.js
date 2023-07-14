import express from 'express'

import { getStudents, getStudent, createStudent } from './database.js'
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
    console.log("getting students")
    const students = await getStudents()
    res.send(students)
})

app.get("/students/:id", async (req, res) => {
    const id = req.params.id
    const student = await getStudent(id)
    res.send(student)
})

app.post("/students", async (req, res) => {
    const { name, level } = req.body
    const student = await createStudent(name, level)
    res.status(201).send(student)
})

app.use((err, req, res, next) => {
    console.log("error occured")
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})