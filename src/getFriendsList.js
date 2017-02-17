/**
 * Created by Stepanov Valentyn on 2/13/2017.
 */


var utils = require("../utils");
var log = require("npmlog");
var apiUrlSummary = "voyager/api/relationships/connectionsSummary";
var apiUrlConnections = "voyager/api/relationships/connections?count=";

function formatData(data) {
    return {
        firstName: data.miniProfile.firstName,
        lastName: data.miniProfile.lastName,
        occupation: data.miniProfile.occupation,
        publicId: data.miniProfile.publicIdentifier,
        userID: data.miniProfile.entityUrn.split(':')[3]
    }
}

module.exports = function (api, ctx) {
    return function getFriendsList(callback) {
        if (!callback && utils.getType(callback) !== "Function") {
            throw {error: "getFriendsList need callback"};
        }

        utils.get(ctx.baseUrl + apiUrlSummary, ctx.jar).then(function (res) {
            var result = JSON.parse(res.body);
            utils.get(ctx.baseUrl + apiUrlConnections + result.numConnections, ctx.jar)
                .then(function (res) {
                    if (res.statusCode !== 200) {
                        throw  {error: res.statusCode + ":" + res.statusMessage + " - " + res.body};
                    }
                    var friendList = JSON.parse(res.body).elements;
                    var formatedList = [];
                    friendList.forEach(function (v) {
                        formatedList.push(formatData(v));
                    });
                    callback(null, formatedList);
                })
                .catch(function (error) {
                    log.error("Error occured in getFriendList ", error);
                    callback(error);
                })
        });
    }
};