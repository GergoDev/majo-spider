const mongodb = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()

console.time("Timer")

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {

    client.db().collection("VideoDataFrames").aggregate([
        {$match: {videoId: 'WxAPsQ7TUaQ'}},
        {$sort: {dataFrameDate: -1}},
        {$limit: 1}
    ]).toArray((err, res) => {
        console.log(res)   
        client.close()
        console.timeEnd("Timer")  
    })
    
})
