exports.home = function(req, res){
	res.render( 'home', 
		{ 
			title: 'myJourney', 
			pageId: 'Home'	
		}
	)
};
exports.create = function(req, res){
	res.render( 'create', 
		{ 
			title: 'myJourney', 
			pageId: 'Create'	
		}
	)
};
exports.map = function(req, res){
	res.render( 'map', 
		{ 
			title: 'myJourney', 
			pageId: 'Map'	
		}
	)
};


exports.storeAccessToken = function(req, res) {
    var code = req.query.code;

    if(code) {
        FB.api('oauth/access_token', {
            client_id: '648327631897525',
            client_secret: '72736a58eb7bdb18d44f6cd325f651d3',
            redirect_uri: 'http://localhost:5000/storeAccessToken/',
            code: code
        }, function (fbRes) {
            if(!fbRes || fbRes.error) {
                console.log(!fbRes ? 'error occurred' : fbRes.error);

                return res.send(500, "Failed to obtain access token: " + JSON.stringify(fbRes.error));
            }

            var accessToken = fbRes.access_token;


            req.session.fbAccessToken = accessToken;

            //var expires = fbRes.expires ? fbRes.expires : 0;
            console.log("Got access token");
            res.redirect("/create.html");
        });

    }
};


    function fetchUserPhotos(uid, res, fromTimestamp, toTimestamp) {

        //until(' + toTimestamp + ').since(' + fromTimestamp + ')
        FB.api(uid +'', { fields : ['id','name', 'photos.limit(1000)']}, function (fbRes) {
            if(!fbRes || fbRes.error) {
                console.log(!fbRes ? 'error occurred' : fbRes.error);
                return res.send(500, "Failed to request photos");
            }

            var mapData = {
                type : "FeatureCollection",
                features: []
            };



            if(fbRes.photos) {
                mapData.features = _.filter(_.map(fbRes.photos.data, function(photo) {

                    console.log(JSON.stringify(photo));
                    if(photo.place && photo.place.location && photo.place.location.longitude) {
                        return  {
                            type: "Feature",
                            properties : {
                                title : photo.name,
                                image : _.first(photo.images),
                                created_time : photo.created_time
                            },
                            geometry : {
                                type : "Point",
                                coordinates : [
                                    photo.place.location.longitude,
                                    photo.place.location.latitude
                                ]
                            }
                        };
                    }
                }));
            }

            res.send(mapData);
        });
    }

    exports.images = function(req, res) {
        var accessToken = req.session.fbAccessToken;
        /*var fromTimestamp = req.query.fromTimestamp;
        var toTimestamp = req.query.toTimestamp;

        if(!fromTimetamp || !toTimestamp) {
            return res.send(500, "Please specify fromTimestamp and toTimestamp")
        }*/


        if(!accessToken) {
            return res.send(500, "Access token not set in session, please login first");
        }

        res.set("Content-Type", "application/json");
        //FB.setAccessToken('CAACEdEose0cBAA2g1RwGq004OFraoxZCXwy7XEskZAgKkQZBVmFkJml7R6hnZB0rKcutW6vplDfPbdRzM3fS8PZC4oEdujc8V6io6xYOECCZC1yLYWcdQd2OBXtgZBVVbJxkaZAhKZCGwD2GR5uPwxvZAlC7CnUmBctZAZBS46KSq6ewNKFpD6hj6fjmj07EkLjGAaL9uC7aQYPFdAZDZD');
        FB.setAccessToken(accessToken);


        FB.api('fql', { q: 'select uid from user where uid = me()' }, function (fbRes) {
          if(!fbRes || fbRes.error) {
            console.log(!fbRes ? 'error occurred' : res.error);
            return res.send(500, "Failed to get uid");
          }

            console.log(JSON.stringify(fbRes.data[0].uid));
            fetchUserPhotos(fbRes.data[0].uid, res, fromTimestamp, toTimestamp);

        });
    }


