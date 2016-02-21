'use strict';

window.onload = function() {
    get('/v1/pacs', function(res) {
        if (res) {
            res.pacs.forEach(function(pac) {
                var edit = document.createElement('a');
                edit.href = '/internal/pac.html?iden=' + pac.iden;
                edit.style.fontWeight = 'bold';
                edit.textContent = 'Edit';

                var span = document.createElement('span');
                span.textContent = pac.name;

                var div = document.createElement('div');
                div.appendChild(span)
                div.appendChild(space());
                div.appendChild(edit);

                document.body.appendChild(div);
            });
        } else {
            document.body.innerHTML = 'Unable to load pacs'
        }
    });
};
