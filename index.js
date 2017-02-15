"use strict";

var utils = require("./utils");
var cheerio = require("cheerio");
var log = require("npmlog");
var BASE_URL = "https://www.linkedin.com/";

function buildAPI(globalOptions, html, jar){
	var apiFuncNames = [
		'getCurrentUserProfile',
        'getFriendsList',
        'getFullProfile',
        'sendMessage'
	];
	var ctx = {
		baseUrl: BASE_URL,
		userId: null,
		jar: jar,
		globalOptions: globalOptions,
		loggedIn: true
	};

	var api = {
		setOptions: setOptions.bind(null, globalOptions)
	};

	apiFuncNames.map(function(v){
		api[v] = require('./src/'+ v)(api, ctx);
	});

	return [ctx, api];
}

function setOptions(globalOptions, options) {
    Object.keys(options).map(function (key) {
        switch (key) {
            case 'logLevel':
                log.level = options.logLevel;
                globalOptions.logLevel = options.logLevel;
                break;
            case 'forceLogin':
                globalOptions.forceLogin = options.forceLogin;
                break;
            default:
                log.warn('Unrecognized option given to setOptions', key);
                break;
        }
    });
}

function makeLogin(jar, email, password, callback) {
    return function (res) {
        var html = res.body;
        var $ = cheerio.load(html);
        var arr = [];

        $(".login-form input").map(function(i, v){
            if($(v).attr('name')){
                arr.push({val: $(v).val(), name: $(v).attr('name')});
            }
        });

        arr = arr.filter(function(v) {
            return v.val && v.val.length;
        });

        var form = utils.arrToForm(arr);
        form.session_key = email;
        form.session_password = password;

        log.info("Logging in...");

        return utils
            .post(BASE_URL+"uas/login-submit", jar, form)
            .then(utils.saveCookies(jar));
    }
}

function loginHelper(email, password, globalOptions, callback) {
    var mainPromise = null;
    var jar = utils.getJar();

    mainPromise = utils
        .get("https://www.linkedin.com/", null)
        .then(utils.saveCookies(jar))
        .then(makeLogin(jar, email, password, callback))
        .then(function(){
        	return utils
        		.get(BASE_URL, jar)
        		.then(utils.saveCookies(jar));
        })

        var ctx = null;
        var api = null;

        mainPromise = mainPromise
        .then(function(res){
        	var html = res.body;
        	var stuff = buildAPI(globalOptions, html, jar);
        	ctx = stuff[0];
        	api = stuff[1];
        });

    mainPromise
	    .then(function() {
	      log.info('Done logging in.');
	      return callback(null, api);
	    })
	    .catch(function(e) {
	      log.error("Error in login:", e.error || e);
	      callback(e);
	    });


}

function login(loginData, options, callback) {
    if (utils.getType(options) === "Function") {
        callback = options;
        options = {};
    }

    var globalOptions = {
        forceLogin: false
    };
    setOptions(globalOptions, options);

    loginHelper(loginData.email, loginData.password, globalOptions, callback);
}


module.exports = login;