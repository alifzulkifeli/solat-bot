require('dotenv').config()
const Discord = require("discord.js")
const axios = require('axios')
var fs = require('fs');
let json_data = require("./result.json")
const client = new Discord.Client()
const country = "Japan"
const city = "Hachioji"
const year = "2021"

client.on("ready", () => {
  console.log("bot is ready ");
})

const getTime = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = dd + '-' + mm + '-' + yyyy;
  return { today, mm }
}

const findTime = (date, month) => {
  console.log(date);
  return new Promise(function (resolve, reject) {
    let x = 0
    json_data.forEach(element => {
      if (element.date.gregorian.date === date) {
        x = 1
        resolve(element.timings)
      }
    });
    if (x === 0) {
      console.log("reload");
      delete require.cache[require.resolve('./result.json')]
      axios.get(`http://api.aladhan.com/v1/calendarByCity?city=${city}&country=${country}&method=3&month=${month}&year=${year}`)
        .then(function (response) {
          fs.writeFile("result.json", JSON.stringify(response.data.data), function (err, result) {
            if (err) console.log('error', err);
            json_data = require("./result.json");
            reject(("Need to refresh"));
          });
        })
        .catch(function (error) {
          console.log(error);
        })
        .then(function () {
        });
    }
  });
}

client.on('message', (msg) => {
  if (msg.content === ".") {
    const { today, mm } = getTime()
    findTime(today, mm).then((result) => {
      msg.channel.send(`
Date: ${today}

Subuh: **${result.Fajr}**
Sunrise: **${result.Sunrise}**
Zuhur: **${result.Dhuhr}**
Asar: **${result.Asr}**
Maghrib: **${result.Maghrib}**
Isya: **${result.Isha}**`)
    }).catch(err => msg.channel.send(err))
  }
})

client.login(process.env.BOT_TOKEN)