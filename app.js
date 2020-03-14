const axios = require('axios')
const mongodb = require('mongodb')
const schedule = require('node-schedule')
const dotenv = require('dotenv')
dotenv.config()

const videoId = "DixKZZBsmso"
const youtubeApiKey = "AIzaSyB5VDNjUt-kuuShxiYbnzuV2wsbmhEscu4"

/* axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: "statistics",
          id: videoId,
          key: youtubeApiKey
        }
      })
      .then(function (response) {
        let dataToInsert = {
          VideoID: videoId,
          ViewCounter: response.data.items[0].statistics.viewCount,
          Time: new Date()
        }  
        
        sendDataToMongo(dataToInsert)
                
      })
      .catch(function (error) {
        console.log(error);
      }) */

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {

  function sendDataToMongo(data) {
    
    client.db().collection("views").insertOne(data)
    console.log("Insert done, Ready")

  }

  let dataToInsert = {
    VideoID: videoId,
    Time: new Date()
  }  
  
  sendDataToMongo(dataToInsert)

  // var j = schedule.scheduleJob('*/5 * * * * *', function(){

    

  // }) 

})