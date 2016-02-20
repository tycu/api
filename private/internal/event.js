'use strict';

window.onload = function() {
    var event = {}
    var politicians = document.getElementById('politicians');
    var summary = document.getElementById('summary');
    var submit = document.getElementById('submit');
    var error = document.getElementById('error');

    if (location.query['iden']) {
        document.title = 'Update Event ' + location.query['iden'] + ' - Tally'
        submit.textContent = 'Update';
        submit.disabled = true;

        get('/v1/events/' + location.query['iden'], function(res) {
            if (res) {
                console.log(res)
                event = res
                summary.value = event.summary || ''
                politicians.value = event.politician && event.politician.iden
                submit.disabled = false;
            } else {
                document.body.innerHTML = 'Unable to load event';
            }
        });
    }

    get('/v1/politicians', function(res) {
        if (res) {
            res.politicians.forEach(function(politician) {
                var option = document.createElement('option');
                option.text = politician.name
                option.value = politician.iden
                politicians.options.add(option);
                politicians.value = event.politician && event.politician.iden
            });
        } else {
            document.body.innerHTML = 'Unable to load politicians';
        }
    });

    submit.onclick = function() {
        submit.disabled = true;
        error.textContent = '';

        event.summary = summary.value;
        event.politician = politicians.value

        var url = '/v1/events'
        if (event.iden) {
            url += '/' + event.iden
        }

        post(url, event, function(res) {
            submit.disabled = false;

            if (res) {
                window.location = '/internal/event.html?iden=' + res.iden;
            } else {
                error.textContent = 'Save failed';
            }
        });
    };
};
