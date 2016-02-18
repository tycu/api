var express = require('express');
var app = express();

app.post('/v1/news', function(req, res) {
    res.json({
        
    });
});

var port = app.get('port') || 5000
app.listen(port, function() {
    console.log('Example app listening on port ' + port);
});
