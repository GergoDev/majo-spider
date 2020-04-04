const schedule = require('node-schedule')
const axios = require('axios')
const channels = require('./db').db().collection('channels')
const videos = require('./db').db().collection('videos')
const videoDataFrames = require('./db').db().collection('videoDataFrames')
const dotenv = require('dotenv')
dotenv.config()

function videosStatRequest(videoIds) {
  return new Promise((resolve, reject) => {
    axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: "snippet,statistics",
          id: videoIds,
          key: process.env.YOUTUBEAPIKEY
        }
    }).then(function(response) {
        resolve(response.data)
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
          coverPic: video.snippet.thumbnails.high.url,
          category: "N/A",
          status: "on",
          releaseDate: new Date(video.snippet.publishedAt),
          addedDate: new Date()
        }
      )
    })

  if(videosToDatabase.length != 0) {
    let insertResult = await videos.insertMany(videosToDatabase)
    console.log("  ", channelName, insertResult.insertedCount, "videos added")
    insertResult.ops.forEach(addedVideo => console.log("   ", addedVideo.videoName))
  }

}

async function addingNewChannelVideos() {

  // Request all the channels with "status: on" with last video
  let channelsWithLastVideo = await channels.aggregate([
    {$match: {status: 'on'}},
    {$lookup: {from: "videos", localField: "channelId", foreignField: "channelId", as: "channelVideo"}},
    {$unwind: {path: "$channelVideo", preserveNullAndEmptyArrays: true}},
    {$sort: {"channelVideo.releaseDate": -1}},
    {$group: {"_id": "$_id", "channelId": {$first: "$channelId"}, "channelName": {$first: "$channelName"}, "channelAddedDate": {$first: "$addedDate"}, "lastVideo": {$first: "$channelVideo"}}}
  ]).toArray()

  console.log("ADDING NEW CHANNEL VIDEOS TASK RAN", new Date())
  console.log("// Checking for new videos on", channelsWithLastVideo.length, "channels")

  let channelsWithLastVideoPromises = channelsWithLastVideo.map( channel => {
    if(channel.lastVideo) {
      return addingChannelVideos(channel.channelId, channel.lastVideo.releaseDate, channel.channelName)
    } else {
      return addingChannelVideos(channel.channelId, channel.channelAddedDate, channel.channelName)
    }
  })

  await Promise.all(channelsWithLastVideoPromises)

}

async function saveVideosStats() {

  let videosWithOnStatus = await videos.find( {status: "on"} ).toArray()

  let videosWithOnStatusPromises = []

  for(let x = 1; x <= Math.ceil(videosWithOnStatus.length/50); x++) {

    let sliceTo = x * 50
    let videoIds = videosWithOnStatus.map(v => v.videoId).slice(sliceTo-50, sliceTo).join(",")
    videosWithOnStatusPromises.push(videosStatRequest(videoIds))

  }

  let videoStatistics = await Promise.all(videosWithOnStatusPromises)
  
  let videoStatisticsRefactored = videoStatistics.map( statPack => statPack.items.map( video => {
    return(
      {
        videoId: video.id, 
        channelId: video.snippet.channelId, 
        viewCount: Number(video.statistics.viewCount), 
        likeCount: Number(video.statistics.likeCount), 
        dislikeCount: Number(video.statistics.dislikeCount), 
        commentCount: Number(video.statistics.commentCount), 
        dataFrameDate: new Date()
      }
    )
  }))

  let videoStatisticsToDatabase = []
  videoStatisticsRefactored.forEach( statPack => videoStatisticsToDatabase = videoStatisticsToDatabase.concat(statPack))
  
  if(videoStatisticsToDatabase.length != 0) {

    let insertResult = await videoDataFrames.insertMany(videoStatisticsToDatabase)
    console.log("SAVE VIDEOS STATS TASK RAN", new Date())
    console.log("//", insertResult.insertedCount, "Data Frame added to the database.")

  }

}

// var j = schedule.scheduleJob('*/10 * * * * *', async function(){

//     await addingNewChannelVideos()

//     await saveVideosStats()

// })

addingNewChannelVideos().then(_ => saveVideosStats())