const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false }
});

const UserModel = mongoose.model('user', UserSchema);

module.exports = {
    UserModel
}