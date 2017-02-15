"use strict";

var utils = require("../utils");
var log = require("npmlog");
var API_URL = "voyager/api/me";

module.exports = function(api, ctx){
	return function getCurrentUserProfile(callback){
		if(!callback){
			throw {error: "getCurrentUserProfile need callback"};
		}
		utils.get(ctx.baseUrl + API_URL, ctx.jar).then(function (result){
		    callback(null,JSON.parse(result.body));
        }).catch(function (error) {
            log.error("Error in getCurrentUserProfile", error);
            callback(error);
        });
	}
} 
