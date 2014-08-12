import Ember from 'ember';

export default function uploadJSON() {
    var $body = Ember.$(window.document.body),
        $input = Ember.$('<input type="file" accept=".json">')
            .appendTo($body);

    return new Ember.RSVP.Promise(function(resolve) {
        $input
            .on('change', function() {
                var file = this.files[0],
                    reader = new window.FileReader();
                reader.onload = function(e) {
                    Ember.run(function() {
                        resolve(window.JSON.parse(e.target.result));
                    });
                };
                reader.readAsText(file);
            })
            .click();
    }).finally(function() {
        // remove input from body
        $input.remove();
    });
}
