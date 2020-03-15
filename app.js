const axios = require('axios')
const viewsCollection = require('./db').db().collection('VideoDataFrames')
const schedule = require('node-schedule')
const dotenv = require('dotenv')
dotenv.config()

videoId = "WxAPsQ7TUaQ"

function statRequest(videoId) {
  return new Promise((resolve, reject) => {
    axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: "statistics",
          id: videoId,
          key: process.env.YOUTUBEAPIKEY
        }
    }).then(function(response) {
        resolve(response.data.items[0].statistics)
    }).catch(function (error) {
        reject(error)
    })  
  })
}



var j = schedule.scheduleJob('*/5 * * * * *', async function(){

  const {viewCount, likeCount, dislikeCount, commentCount} = await statRequest(videoId)

  viewsCollection.insertOne({
    videoId, 
    channelId: "channelId", 
    dataFrameDate: new Date(), 
    viewCount, 
    likeCount, 
    dislikeCount, 
    commentCount
  }, () => console.log("Insert done, Ready"))

})