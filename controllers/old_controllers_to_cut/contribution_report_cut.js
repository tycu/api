// app.post('/get-contribution-report', function(req, res) {
//   if (!req.body.date) {
//     res.sendStatus(400)
//     return
//   }

//   var date = new Date(req.body.date * 1000)

//   var dates = []
//   for (var i = 0; i < 8; i++) {
//     var day = date.getUTCDay()
//     while (date.getUTCDay() == day) {
//       date.setTime(date.getTime() - (60 * 60 * 1000))
//     }
//     date.setUTCHours(0, 0, 0, 0)
//     if (i > 0) {
//       dates.push(date / 1000)
//     }
//   }

//   var tasks = []
//   dates.forEach(function(date) {
//     tasks.push(function(callback) {
//       redis.lrange(redisKeys.contributionsOnDay(date), 0, -1, function(err, reply) {
//         callback(err, reply)
//       })
//     })
//   })

//   async.parallel(tasks, function(err, results) {
//     if (err) {
//       console.error(err)
//       res.sendStatus(500)
//     } else {
//       var tasks = []
//       results.forEach(function(result) {
//         tasks.push(function(callback) {
//           if (result.length > 0) {
//             entities.getContributions(result, function(err, contributions) {
//               callback(err, contributions)
//             })
//           } else {
//             callback(null, [])
//           }
//         })
//       })

//       async.parallel(tasks, function(err, results) {
//         if (err) {
//           console.error(err)
//           res.sendStatus(500)
//         } else {
//           var report = {}
//           for (var i = 0; i < dates.length; i++) {
//             report[dates[i]] = results[i]
//           }
//           res.json(report)
//         }
//       })
//     }
//   })
// })
