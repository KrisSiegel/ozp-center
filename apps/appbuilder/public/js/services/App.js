// From Apps Mall UI
'use strict';

angular.module('AppBuilder').factory('App', function($resource) {
    return $resource(Ozone.Service("Apps").getServicePath() + 'app/:id', {}, {
        query: {
            method: 'GET',
            isArray: true,
            transformResponse: function(response) {
                if (typeof response == 'string') {
                    try {
                        response = JSON.parse(response);
                    } catch (e) {
                        console.log('Error in App.query response. ' + e)
                        return [];
                    }
                }
                for (var i = 0; i < response.length; ++i) {
                    response[i].smallPhoto = Ozone.Service("Persistence").Store("apps").Drive("images").getDrivePath() + response[i].images.smallBannerId;
                    response[i].largePhoto = Ozone.Service("Persistence").Store("apps").Drive("images").getDrivePath() + response[i].images.largeBannerId;
                    response[i].icon = Ozone.Service("Persistence").Store("apps").Drive("images").getDrivePath() + response[i].images.iconId;
                    response[i].squareIcon = Ozone.Service("Persistence").Store("apps").Drive("images").getDrivePath() + response[i].images.iconId;
                }
                return response;
            }
        }
    });
});
