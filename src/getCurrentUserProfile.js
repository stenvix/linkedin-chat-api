"use strict";

var utils = require("../utils");
var log = require("npmlog");
var API_URL = "voyager/api/me";

function formatData(data) {
    return {
        firstName: data.miniProfile.firstName,
        lastName: data.miniProfile.lastName,
        plainId: data.plainId,
        occupation: data.miniProfile.occupation,
        publicIdentifier: data.miniProfile.publicIdentifier,
        userID: data.miniProfile.entityUrn.split(':')[3]
    }
}

module.exports = function (api, ctx) {
    return function getCurrentUserProfile(callback) {
        if (!callback) {
            throw new Error("getCurrentUserProfile need callback");
        }
        utils.get(ctx.baseUrl + API_URL, ctx.jar).then(function (res) {
            if (res.statusCode != 200) {
                callback(res.statusCode + ":" + res.statusMessage + " - " + res.body);
            }
            callback(null, formatData(JSON.parse(res.body)));
        }).catch(function (error) {
            log.error("Error in getCurrentUserProfile ", error);
            callback(error);
        });
    }
} 
