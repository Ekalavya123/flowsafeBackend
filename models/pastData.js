const mongoose = require('mongoose')

const {Schema} =mongoose;

const pastDataSchema= new Schema({
    pressurePsi:{
        type:Number,
        required:true
    },
    pressureBar:{
        type:Number,
        required:true
    },
    time:{
        type: String ,
        required:true
    }
});

module.exports = mongoose.model('pastData',pastDataSchema);