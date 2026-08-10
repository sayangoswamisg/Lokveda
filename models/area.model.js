// models/area.model.js
import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Area name is not provided']
    },
    open: {
        type: String,
        required: [true, 'Opening time not mentioned'],
        default: '--:--'
    },
    close: {
        type: String,
        required: [true, 'Closing time not mentioned'],
        default: '--:--'
    },
    lat: {
        type: Number,
        required: [true, 'Missing latitude']
    },
    lon: {
        type: Number,
        required: [true, 'Missing longitude']
    },
    mapUrl: {
        type: String,
        required: [true, 'Empty Map URL']
    },
    activeServices: {
        type: Array,
        default: []
    },
    inactiveServices: {
        type: Array,
        default: []
    }
});

export default mongoose.model('Area', areaSchema);