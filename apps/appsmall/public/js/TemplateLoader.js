(function($, window) {

    var path = 'templates/templates.html';

    // If testing, use a different path.
    if (window['jasmine'] !== undefined) {
        path = '../' + path;
    }
    // Get the template file
    $.get(path, function(data) {
        // Loop over the script tags and add them to templates array
        $(data).filter('script').each(function() {
            $('head').append(this);
        });
    });
}(jQuery, window));
