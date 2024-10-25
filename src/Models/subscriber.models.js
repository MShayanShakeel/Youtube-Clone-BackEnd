const mongoose = require('mongoose');
const subScriberSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,  //user who subscribe channel  
        ref: "User"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, //channel who already subscribe channel
        ref: "User"
    }

})

const Subscriber = mongoose.model('Subscriber', subScriberSchema)
module.exports = Subscriber;







