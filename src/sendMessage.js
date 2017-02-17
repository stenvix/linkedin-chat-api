/**
 * Created by Stepanov Valentyn on 2/13/2017.
 */
var utils = require("../utils");
var log = require("npmlog");
var apiUrl = "voyager/api/messaging/conversations?action=create";

function createMessageBody(message, recipient) {
    return {
        conversationCreate: {
            eventCreate: {
                value: {
                    "com.linkedin.voyager.messaging.create.MessageCreate": {
                        body: message,
                        attachments: []
                    }
                }
            },
            recipients: [recipient],
            subtype: "MEMBER_TO_MEMBER",
            name: ""
        }
    }
}

module.exports = function (api, ctx) {
    return function (message, userID) {
        var form = createMessageBody(message, userID);
        utils.postJSON(ctx.baseUrl + apiUrl, ctx.jar, form).then(function (res) {
            if(res.statusCode!==201){
                log.error("Error occurred while message sending");
                throw {error: "Error occurred while message sending"}
            }
        }).catch(function (error) {
            log.error(error);
        })
    }
};