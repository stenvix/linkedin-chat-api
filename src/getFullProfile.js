var utils = require("../utils");
var log = require("npmlog");
var apiUrl = "voyager/api/identity/profiles/{userId}/profileView";

function getOccupations(data) {
    var positions = [];
    if (data && data.length > 0) {
        data.forEach(function (v) {
            positions.push({
                company: v.companyName,
                companyLocation: v.locationName,
                occupation: v.title,
                timePeriod: v.timePeriod
            })
        });
    }
    return positions;
}

function formatData(data) {
    return {
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        industry: data.profile.industryName,
        occupations: getOccupations(data.positionView.elements),
        location: data.profile.locationName,
        interests: data.profile.interests,
        headline: data.profile.headline,
        summary: data.profile.summary
    }
}

module.exports = function (api, ctx) {
    return function getFriendsList(userId, callback) {
        if (callback && utils.getType(callback) !== 'Function') {
            throw {error: "getFriendsList need callback"};
        }

        utils.get(ctx.baseUrl + apiUrl.replace('{userId}', userId), ctx.jar).then(function (res) {
            if (res.statusCode == 403) {
                callback(res.statusMessage + ": " + res.body);
            }

            callback(null, formatData(JSON.parse(res.body)));
        }).catch(function (error) {
            callback(error);
        })
    }
};