App.Router.map(function () {
    // Add your routes here
    this.resource('vaccines');
    this.resource('vaccine', { path: '/vaccine/:vaccine_id' }, function() {
        this.route('step2');
        this.route('step3');
    });
});
