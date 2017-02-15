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
            console.log("sucess");
        }).catch(function (error) {
            console.log(error);
        })
    }
};