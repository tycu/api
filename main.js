var express = require('express');
var app = express();

app.get('/v1/news', function(req, res) {
    res.json({

    });
});

var port = process.env.PORT || 5000
app.listen(port, function() {
    console.log('Example app listening on port ' + port);
});
