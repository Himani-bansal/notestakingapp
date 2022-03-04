const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Note');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');

//route:1 to fetch notes 
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        //finding notes corresponding to the id 
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("inetrnal server error");
    }

})
//route:2 to add more notes.
router.post('/addnotes', fetchuser, [
    //adding title and description as compulsory form
    body('title').isLength({ min: 3 }),
    body('description').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //enetring title description and others and save them
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("inetrnal server error");
    }
})
//route3: to update the existing notes we are required to enter id too for the security purpose
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {

        const { title, description, tag } = req.body;
//updateing title description and tag according to the need
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
//finding note by id to be updated and update it if note not found return not found or if the id is wrong then not allowed
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(400).send("not found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed");
        }
//updating the note by fxn find by id and update
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("inetrnal server error");
    }

})
//deleting the existing note by entering its id
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //find if the note corresponds to entered id exists or not.
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("not allowed");
        }
        //finding if the id enterd is write or not.
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed");
        }
        //if note corresponse to id exists then delete it by fxn findid and delete it
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "success": "note has been deleted", note: note })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("inetrnal server error");
    }
})
module.exports = router