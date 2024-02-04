const mongoose = require('mongoose')

const {Schema} =mongoose;

const currentDataSchema= new Schema({
    id:{
        type: Boolean,
        default:1
    }, 
    incoming:{
        type: Boolean,
        required: true
    }, 
    drain:{
        type: Boolean,
        required: true
    },
    pump:{
        type: Boolean,
        required: true
    },
    togglePressure:{
        type:Number,
        required:true
    },
    drainPressure:{
        type:Number,
        required:true
    }
});

module.exports = mongoose.model('currentData',currentDataSchema);