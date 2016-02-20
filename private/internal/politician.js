'use strict';

window.onload = function() {
    var politician = {}
    var thumbnailUrl = document.getElementById('thumbnailUrl');
    var name = document.getElementById('name');
    var submit = document.getElementById('submit');
    var error = document.getElementById('error');

    if (location.query['iden']) {
        submit.textContent = 'Update';
        submit.disabled = true;

        get('/v1/politicians/' + location.query['iden'], function(res) {
            if (res) {
                console.log(res)
                politician = res
                document.title = 'Update ' + politician.name + ' - Tally'
                thumbnailUrl.value = politician.thumbnailUrl || ''
                name.value = politician.name || ''
                submit.disabled = false;
            } else {
                document.body.innerHTML = 'Unable to load politician';
            }
        });
    }

    submit.onclick = function() {
        submit.disabled = true;
        error.textContent = '';

        politician.thumbnailUrl = thumbnailUrl.value
        politician.name = name.value;

        var url = '/v1/politicians'
        if (politician.iden) {
            url += '/' + politician.iden
        }

        post(url, politician, function(res) {
            submit.disabled = false;

            if (res) {
                window.location = '/internal/politician.html?iden=' + res.iden;
            } else {
                error.textContent = 'Save failed';
            }
        });
    };
};
