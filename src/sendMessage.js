/**
 * Created by Stepanov Valentyn on 2/13/2017.
 */
var utils = require("../utils");
var log = require("npmlog");
var API_URL = "voyager/api/me";

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
    return function (message, userUrn) {
        var form = createMessageBody(message, userUrn);
        utils.postJSON(ctx.baseUrl + "voyager/api/messaging/conversations?action=create", ctx.jar, form).then(function (res) {
            if(res.statusCode!==201){
                log.error("Error occurred while message sending");
                throw {error: "Error occurred while message sending"}
            }
            var date = new Date();
            log.info("Message successfully sent at " + date.getHours() + ":"+ date.getMinutes());
        }).catch(function (error) {
            log.error(error);
        })
    }
};