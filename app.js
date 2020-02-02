const axios = require('axios')
const mongodb = require('mongodb')
var schedule = require('node-schedule');

const videoId = "DixKZZBsmso"
const youtubeApiKey = "AIzaSyB5VDNjUt-kuuShxiYbnzuV2wsbmhEscu4"

mongodb.connect("mongodb+srv://todoAppUser:todoappjelszo@cluster0-wtowc.mongodb.net/YouTube?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {

  function sendDataToMongo(data) {
    
    client.db().collection("views").insertOne(data)
    console.log("Insert done, Ready")

  }

  var j = schedule.scheduleJob('*/10 * * * * *', function(){

    axios.get('https://www.googleapis.com/youtube/v3/videos', {
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
      })

  })

})