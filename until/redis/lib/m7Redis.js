var redis = require("redis");

var out = {
    connect: require("./connect"),
    hash: require("./hash"),
    string: require("./string"),
    list: require("./list"),
    set: require("./set"),
    pubsub: require("./pub-sub")
};
module.exports = out;
