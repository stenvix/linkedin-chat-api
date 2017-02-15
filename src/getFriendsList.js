/**
 * Created by Stepanov Valentyn on 2/13/2017.
 */


var utils = require("../utils");
var log = require("npmlog");
var API_URL = "voyager/api/me";

function formatData(data) {
    return {
        firstName: data.miniProfile.firstName,
        lastName: data.miniProfile.lastName,
        occupation: data.miniProfile.occupation,
        userId: data.miniProfile.publicIdentifier,
        userUrn: data.miniProfile.entityUrn.split(':')[3]
    }
}

module.exports = function (api, ctx) {
    return function getFriendsList(callback) {
        if (!callback && utils.getType(callback) !== "Function") {
            throw {error: "getFriendsList need callback"};
        }

        //
        // utils.get("https://www.linkedin.com/voyager/api/identity/profiles/iryna-shyman-a385a6132/profileContactInfo", ctx.jar).then(function (res) {
        //     var res1 = JSON.parse(res.body);
        //     console.log(res1)
        // });
        //
        //
        // utils.get("https://www.linkedin.com/voyager/api/identity/profiles/iryna-shyman-a385a6132/profileView", ctx.jar).then(function (res) {
        //     var res1 = JSON.parse(res.body);
        //     console.log(res1)
        // });

        utils.get(ctx.baseUrl + "voyager/api/relationships/connectionsSummary", ctx.jar).then(function (res) {
            var result = JSON.parse(res.body);
            utils.get(ctx.baseUrl + "voyager/api/relationships/connections?count=" + result.numConnections, ctx.jar)
                .then(function (res) {
                    var friendList =  JSON.parse(res.body).elements;
                    var formatedList = [];
                    friendList.forEach(function (v) {
                        formatedList.push(formatData(v));
                    });
                    callback(null,formatedList);
                })
                .catch(function (error) {
                    log.error("Error occured in getFriendList", error);
                    callback(error);
                })
        });
    }
};