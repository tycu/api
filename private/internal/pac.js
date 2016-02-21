'use strict';

window.onload = function() {
    var pac = {}
    var name = document.getElementById('name');
    var submit = document.getElementById('submit');
    var error = document.getElementById('error');

    if (location.query['iden']) {
        submit.textContent = 'Update';
        submit.disabled = true;

        get('/v1/pacs/' + location.query['iden'], function(res) {
            if (res) {
                console.log(res)
                pac = res
                document.title = 'Update ' + pac.name + ' - Tally'
                name.value = pac.name || ''
                submit.disabled = false;
            } else {
                document.body.innerHTML = 'Unable to load pac';
            }
        });
    }

    submit.onclick = function() {
        submit.disabled = true;
        error.textContent = '';

        pac.name = name.value;

        var url = '/v1/pacs'
        if (pac.iden) {
            url += '/' + pac.iden
        }

        post(url, pac, function(res) {
            submit.disabled = false;

            if (res) {
                window.location = '/internal/pac.html?iden=' + res.iden;
            } else {
                error.textContent = 'Save failed';
            }
        });
    };
};
