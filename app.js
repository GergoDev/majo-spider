const axios = require('axios')
const viewsCollection = require('./db').db().collection('views')
const schedule = require('node-schedule')
const dotenv = require('dotenv')
dotenv.config()

const videoId = "DixKZZBsmso"

/* axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      part: "statistics",
      id: videoId,
      key: process.env.YOUTUBEAPIKEY
    }
}).then(function (response) {
    let dataToInsert = {
      VideoID: videoId,
      ViewCounter: response.data.items[0].statistics.viewCount,
      Time: new Date()
    }  
    
    sendDataToMongo(dataToInsert)
          
}).catch(function (error) {
    console.log(error);
}) */

    
    viewsCollection.insertOne({
      VideoID: videoId,
      Time: new Date()
    }, () => console.log("Insert done, Ready"))


  // var j = schedule.scheduleJob('*/5 * * * * *', function(){

    

  // }) 