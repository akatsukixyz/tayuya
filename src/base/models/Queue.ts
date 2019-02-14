const mongoose = require('mongoose');
const Queue = mongoose.Schema({ guild: String, songs: Array, now: Object }, { strict: true });
module.exports = mongoose.model('Queue', Queue);