"use strict"

var bluebird = require("bluebird");
var request = bluebird.promisify(require("request").defaults({jar: true}));
var stream = require('stream');
var log = require('npmlog');


function arrToForm(form) {
    return arrayToObject(form, function (v) {
        return v.name;
    }, function (v) {
        return v.val;
    });
}

function arrayToObject(arr, getKey, getValue) {
    return arr.reduce(function (acc, val) {
        acc[getKey(val)] = getValue(val);
        return acc;
    }, {});
}


function saveCookies(jar) {
    return function (res) {
        var cookies = res.headers['set-cookie'] || [];
        cookies.forEach(function (c) {
            if (c.indexOf("linkedin.com") > -1) {
                if(c.indexOf("deleteMe") < 0 && c.indexOf("delete me") < 0 ){
                    jar.setCookie(c, "https://www.linkedin.com");
                }
            }
        });
        return res;
    };
}


function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}


function getHeaders(url) {
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://www.linkedin.com/',
        'Host': url.replace('https://', '').split("/")[0],
        'Origin': 'https://www.linkedin.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    return headers;
}


function get(url, jar, qs) {
    // I'm still confused about this
    if (getType(qs) === "Object") {
        for (var prop in qs) {
            if (qs.hasOwnProperty(prop) && getType(qs[prop]) === "Object") {
                qs[prop] = JSON.stringify(qs[prop]);
            }
        }
    }
    var op = {
        headers: getHeaders(url),
        timeout: 60000,
        qs: qs,
        url: url,
        method: "GET",
        jar: jar,
        gzip: true
    };

    if(jar){
        var cookies = jar.getCookies(url);
        cookies.forEach(function(v){
            if(v.key == "JSESSIONID"){
                op.headers['Csrf-Token'] = v.value.replace(/^"(.*)"$/, '$1');
            }
        });
    }

    return request(op).then(function (res) {
        return res[0];
    });
}

function post(url, jar, form) {
    var op = {
        headers: getHeaders(url),
        timeout: 60000,
        url: url,
        method: "POST",
        form: form,
        jar: jar,
        gzip: true
    };

    if(jar){
        var cookies = jar.getCookies(url);
        cookies.forEach(function(v){
            if(v.key == "JSESSIONID"){
                op.headers['Csrf-Token'] = v.value.replace(/^"(.*)"$/, '$1');
            }
        });
    }

    return request(op).then(function (res) {
        return res[0];
    });
}

function postJSON(url, jar, form) {
    var headers = getHeaders(url);
    headers['Content-Type'] = 'application/json';
    headers["Content-Length"] = JSON.stringify(form).length;
    // headers["Accept"] = "*/*";
    // headers["Accept-Encoding"] = "gzip, deflate, br";
    // headers["Accept-Language"] = "ru,en-US;q=0.8,en;q=0.6,uk;q=0.4";
    // headers["Pragma"] = "no-cache";

    var op = {
        headers: headers,
        timeout: 60000,
        url: url,
        method: "POST",
        json: form,
        jar: jar,
        gzip: true
    };

    if(jar){
        var cookies = jar.getCookies(url);
        cookies.forEach(function(v){
            if(v.key == "JSESSIONID"){
                op.headers['Csrf-Token'] = v.value.replace(/^"(.*)"$/, '$1');
            }
        });
    }

    return request(op).then(function (res) {
        return res[0];
    });
}

function postFormData(url, jar, form, qs) {
    var headers = getHeaders(url);
    headers['Content-Type'] = 'application/json';
    var op = {
        headers: headers,
        timeout: 60000,
        url: url,
        method: "POST",
        formData: form,
        qs: qs,
        jar: jar,
        gzip: true
    };

    return request(op).then(function (res) {
        return res[0];
    });
}

module.exports = {
    arrToForm: arrToForm,
    getType: getType,
    get: get,
    getJar: request.jar,
    getHeaders: getHeaders,
    saveCookies: saveCookies,
    post: post,
    postFormData: postFormData,
    postJSON: postJSON
};
