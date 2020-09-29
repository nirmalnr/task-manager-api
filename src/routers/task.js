const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) =>{
    req.body['owner'] = req.user._id
    const task = new Task(req.body)
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        es.status(400).send(e)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /task?sortBy=completed:asc,createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    const sort = {}
    if(req.query.sortBy){
        const fields = req.query.sortBy.split(',')
        fields.forEach((field) => {
            sort[field.split(':')[0]] = field.split(':')[1] === 'asc' ? 1 : -1
        })
        console.log(sort);
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const allowedFields = ['description','completed']
    console.log(req.body)
    if ( !Object.keys(req.body).every((field)=>allowedFields.includes(field)) ) {
        return res.status(500).send({'error':'Invalid request'})
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send()   
        }
        Object.keys(req.body).forEach( (key) => task[key] = req.body[key])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({_id,owner: req.user.id})
        if(!task){
            return res.status(404).send()   
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
