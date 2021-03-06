const mongodb = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()

console.time("Timer")

// mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {

//     client.db().collection("videos").aggregate([
//         { $match: 
//             {
//                 $and: [
//                     { status: 'on' },
//                     { releaseDate: { $gt: new Date("2020-03-20T00:00:00.000Z"),$lt: new Date("2020-04-01T00:00:00.000Z") }}
//                 ]
//             }
//         },
//         { $lookup: 
//             {
//                 from: "videoDataFrames",
//                 let: { videoId: "$videoId"},
//                 pipeline: [
//                      { $match:
//                          { $expr:
//                              { $and:
//                                  [
//                                     { $eq: ["$videoId", "$$videoId" ] },
//                                     { $gte: ["$dataFrameDate", new Date("2020-03-23T00:00:00.000Z") ] },
//                                     { $lte: ["$dataFrameDate", new Date("2020-03-30T00:01Z") ] }
//                                  ]
//                              }
//                          }
//                      },
//                      { $sort: { dataFrameDate: 1 } }
//                  ],
//                  as: "videoDataFrames"
//             }
//         },
//         {$lookup: 
//             {
//                 from: "channels",
//                 localField: "channelId",
//                 foreignField: "channelId",
//                 as: "channelInfo"
//             }
//         }
//     ]).toArray((err, res) => {
//         console.log(res[3])   
//         console.log("ERROR", err)   
//         client.close()
//         console.timeEnd("Timer") 

//     })

// })


// mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {

//     client.db().collection("channels").aggregate([
//         {$match: {status: 'on'}},
//         {$lookup: {from: "videos", localField: "channelId", foreignField: "channelId", as: "channelVideo"}},
//         {$unwind: {path: "$channelVideo", preserveNullAndEmptyArrays: true}},
//         {$sort: {"channelVideo.releaseDate": -1}},
//         {$group: {"_id": "$_id", "channelId": {$first: "$channelId"}, "channelName": {$first: "$channelName"}, "channelAddedDate": {$first: "$addedDate"}, "lastVideo": {$first: "$channelVideo"}}}
//     ]).toArray((err, res) => {
//         console.log(res)   
//         console.log("ERROR", err)   
//         client.close()
//         console.timeEnd("Timer")  
//     })

// })

// mongodb.connect(
//     process.env.CONNECTIONSTRING,
//     { useNewUrlParser: true, useUnifiedTopology: true },
//     function (err, client) {

//         client.db().collection("videoDataFrames").updateMany(
//             { dataFrameDate: { $gt: new Date("2020-04-06T23:00:00.000Z") } },
//             { $set: { dataFrameDate: new Date("2020-04-06T23:00:00.000Z") } }
//         ).then(() => {
//             console.log("done")
//         })

//     })

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {

    client.db().collection("channels").aggregate([
        { $match: 
            {
                $and: [
                    { status: 'on' },
                    { addedDate: { $lt: new Date("2020-04-06T00:00:00.000+0100") }}
                ]
            }
        },
        { $lookup: 
            {
                from: "channelDataFrames",
                let: { channelId: "$channelId"},
                pipeline: [
                     { $match:
                         { $expr:
                             { $and:
                                 [
                                    { $eq: ["$channelId", "$$channelId"] },
                                    { $gte: ["$dataFrameDate", new Date("2020-04-06T00:00:00.000+0100") ] },
                                    { $lte: ["$dataFrameDate", new Date("2020-04-12T00:01:00.000+0100") ] }
                                 ]
                             }
                         }
                     },
                     { $sort: { dataFrameDate: 1 } }
                 ],
                 as: "dataFrames"
            }
        },
        {$limit: 3}
    ]).toArray((err, res) => {
        res.forEach( res => console.log(res))   
        console.log("ERROR", err)   
        client.close()
        console.timeEnd("Timer") 

    })

})