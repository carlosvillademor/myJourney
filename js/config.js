var _ = require('lodash');
var Environments = {
    app: {
        port: process.env.PORT || 5000,
        appVersion: '0.1.0',
        staticPath: __dirname + '/../static',
        appFacebookId: 648327631897525,
        facebookScope: ['user_photos', 'read_stream']
    }
};

Environments = _.extend(Environments, {
    development: {
        mongoDBUrl: 'mongodb://127.0.0.1:27017/test'
    },
    production: {
        mongoDBUrl: process.env.MONGOHQ_URL
    }
});

var EnvironmentLoader = {
    load: function(env) {
        var _env  = {name: env};
        for (var attr in Environments.app)  { _env[attr] = Environments.app[attr]; }
        for (var attr in Environments[env]) { _env[attr] = Environments[env][attr]; }
        return _env;
    }
};

module.exports = EnvironmentLoader;