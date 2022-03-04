import React, { useContext } from 'react'
import NoteContext from '../context/notes/noteContext'
const Noteitem = (props) => {
    const context = useContext(NoteContext);
    const { deleteNote, editNote } = context;
    const { note, updateNote } = props;
    return (
        <div className='container col-md-4 my-3'>
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{note.title}</h5>
                    <p className="card-text">{note.description}</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => { updateNote(note); props.showAlert("Updated Successfully", "success") }}>Edit</button>
                    <button type="button" className="btn btn-danger btn-sm mx-2 " onClick={() => { deleteNote(note._id); props.showAlert("Deleted Successfully", "success") }}>Delete</button>

                </div>

            </div>
        </div>
    )
}

export default Noteitem
