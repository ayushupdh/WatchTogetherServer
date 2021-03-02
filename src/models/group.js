const mongoose = require('mongoose')


const Schema = mongoose.Schema

const groupSchema = new Schema(
    {
    name:{
        type:String
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref:'User',
    }],
    // liked_movies: [Movies],
    // disliked_movies: [Movies],
    sessions: [{
        type : Date, default: Date.now
    }],
    current_session_time: Date,
    created_by: {
        type: Schema.Types.ObjectId,
        ref:'User',
    }
    },
    {
    timestamps:true
})





const Group = mongoose.model('Group',groupSchema)

module.exports =Group