const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true}, 
    password: {type: String, required: true},
    isadmin: {type: Boolean, default: false},
    img: {type: String},
    address: {type: String},
    phone: {type: String}
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);