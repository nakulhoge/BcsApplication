
const mongoose = require('mongoose');

const FlatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    img: {
        type:String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    requi: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    
});

const FlatModel = mongoose.model("flatData", FlatSchema);

module.exports = FlatModel;
