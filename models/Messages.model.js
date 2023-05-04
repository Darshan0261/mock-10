const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    sender_id: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    text: { type: String, required: true },
    time: { type: Date, required: true }
})

const MessageModel = mongoose.model('message', MessageSchema)

module.exports = {
    MessageModel
}