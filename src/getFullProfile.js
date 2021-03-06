var utils = require("../utils");
var log = require("npmlog");
var apiUrl = "voyager/api/identity/profiles/{publicId}/profileView";

// https://www.linkedin.com/voyager/api/identity/profiles/iryna-shyman-a385a6132/profileContactInfo"

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
    return function getFriendsList(publicId, callback) {
        if (callback && utils.getType(callback) !== 'Function') {
            throw {error: "getFriendsList need callback"};
        }

        utils.get(ctx.baseUrl + apiUrl.replace('{publicId}', publicId), ctx.jar).then(function (res) {
            if (res.statusCode !== 200) {
                callback(res.statusCode + ":" + res.statusMessage + " - " + res.body);
            }

            callback(null, formatData(JSON.parse(res.body)));
        }).catch(function (error) {
            log.error("Error occured in getFriendsList " + error);
            callback(error);
        })
    }
};