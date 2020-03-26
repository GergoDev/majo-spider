const axios = require('axios')
const channels = require('./db').db().collection('channels')
const videos = require('./db').db().collection('videos')
const dotenv = require('dotenv')
dotenv.config()

function videoStatRequest(videoId) {
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

function channelActivityRequest(channelId, fromDate) {
  return new Promise((resolve, reject) => {
    axios.get('https://www.googleapis.com/youtube/v3/activities', {
      params: {
        part: "snippet,contentDetails",
        channelId: channelId,
        publishedAfter: fromDate,
        maxResults:50,
        key: process.env.YOUTUBEAPIKEY
      }
    }).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      console.log("!!!Error during channelActivityRequest!!!")
    })
  })
}

async function addingChannelVideos(channelId, fromDate, channelName) {
  let { items: channelVideos } = await channelActivityRequest(channelId, fromDate)

  let videosToDatabase = channelVideos
    .filter(v => (v.snippet.type === 'upload') && v.contentDetails.upload.videoId && (new Date(v.snippet.publishedAt).getTime() !== new Date(fromDate).getTime()))
    .map(video => {
      return (
        {
          videoId: video.contentDetails.upload.videoId,
          channelId: video.snippet.channelId,
          videoName: video.snippet.title,
          coverPic: video.snippet.thumbnails.maxres.url,
          category: "N/A",
          status: "on",
          releaseDate: new Date(video.snippet.publishedAt),
          addedDate: new Date()
        }
      )
    })

  if(videosToDatabase.length != 0) {
    let insertResult = await videos.insertMany(videosToDatabase)
    console.log(channelName, insertResult.insertedCount, "videos added")
    insertResult.ops.forEach(addedVideo => console.log("   ", addedVideo.videoName))
  }

}

// addingChannels(channelsToAdd).then(channelsAdded => {

//   if (channelsAdded) {
//     let currentDate = new Date()
//     let twoMonthsBefore = currentDate.getTime() - (60 * 24 * 60 * 60 * 1000)
//     let videosFrom = new Date(twoMonthsBefore)

//     let addingVideosPromises = channelsAdded.map(channel => addingChannelVideos(channel.channelId, videosFrom, channel.channelName))

//     Promise.all(addingVideosPromises)
//   }

// })

var j = schedule.scheduleJob('*/5 * * * * *', async function(){

console.log("Task running")

  // const {viewCount, likeCount, dislikeCount, commentCount} = await videoStatRequest(videoId)

  // videoDataFrames.insertOne({
  //   videoId, 
  //   channelId: "channelId", 
  //   dataFrameDate: new Date(), 
  //   viewCount, 
  //   likeCount, 
  //   dislikeCount, 
  //   commentCount
  // }, () => console.log("Insert done, Ready"))

})
console.log(j)