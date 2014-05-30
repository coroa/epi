App.Router.map(function () {
    // Add your routes here
    this.resource('requirement', { path: '/:requirement_id' }, function() {
        this.route('step2');
        this.route('step3');
    });
});
