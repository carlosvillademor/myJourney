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