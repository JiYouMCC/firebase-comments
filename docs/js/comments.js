Comments = {
    _auth: undefined,
    _sync: undefined,
    _timestamp: undefined,
    init: function(type, config) {
        if (type == "firebase") {
            firebase.initializeApp(config);
            Comments._auth = firebase.auth();
            Comments._sync = firebase.database();
            Comments._timestamp = firebase.database.ServerValue.TIMESTAMP;
        } else if (type == "wilddog") {
            var app = wilddog.initializeApp(config);
            Comments._auth = app.auth();
            Comments._sync = app.sync();
            Comments._timestamp = app.sync().ServerValue.TIMESTAMP;
        }
    },
    handleError: function(error) {
        console.log(error);
    },
    errors: {
        POSTID_CAN_NOT_BLANK: "文章ID不能为空",
    },
    handleCallback: function(callback, returnValue) {
        if (callback) {
            callback(returnValue)
        }
    },
    comment: {
        list: function(post, callback) {
            // TODO pagenation
            if (post) {
                Comments._sync.ref("/comments").orderByChild("post").equalTo(post).once("value", function(snapshot) {
                    Comments.handleCallback(callback, snapshot.val());
                });
            } else {
                Comments.handleError(Comments.errors.POSTID_CAN_NOT_BLANK);
                Comments.handleCallback(callback, undefined);
            }
        },
        listCallback: function(post, callback) {
            if (post) {
                var returnCallback = Comments._sync.ref("/comments").orderByChild("post").equalTo(post);
                returnCallback.on("value", function(snapshot) {
                    callback(snapshot.val());
                });
                return returnCallback;
            } else {
                Comments.handleError(Comments.errors.POSTID_CAN_NOT_BLANK);
                Comments.handleCallback(callback, undefined);
            }
        },
        add: function(name, email, post, comment, url, reply, callback) {
            Comments.post.commentCount.get(post, function(oldCount) {
                var commentRef = Comments._sync.ref("/comments");
                commentRef.push({
                    "name": name,
                    "email": email,
                    "post": post,
                    "timestamp": Comments._timestamp,
                    "comment": comment,
                    "url": url ? url : null,
                    "reply": reply ? reply : null
                }, function(error) {
                    if (error) {
                        Comments.handleError(error);
                        Comments.handleCallback(callback, false);
                    } else {
                        Comments.post.commentCount.set(post, oldCount + 1, function() {
                            Comments.handleCallback(callback, true);
                        });
                    }
                });
            });
        },
        recent: {
            _callback: undefined,
            get: function(count, callback) {
                count = count ? count : 10;
                Comments._sync.ref("/comments").orderByChild("timestamp").limitToLast(count).once("value", function(snapshot) {
                    Comments.handleCallback(callback, snapshot.val());
                });
            },
            updateCallback: function(count, callback) {
                Comments.comment.recent.removeCallback();
                Comments.comment._callback = Comments._sync.ref("/comments").orderByChild("timestamp").limitToLast(count);
                Comments.comment._callback.on("value", function(snapshot) {
                    callback(snapshot.val());
                });
            },
            removeCallback: function() {
                if (Comments.comment._callback) {
                    Comments.comment._callback.remove();
                    Comments.comment._callback = undefined;
                }
            }
        }
    },
    post: {
        commentCount: {
            get: function(post, callback) {
                Comments._sync.ref("/posts/" + post).once("value", function(snapshot) {
                    var count = 0;
                    if (snapshot && snapshot.val() && snapshot.val().count) {
                        count = snapshot.val().count
                    }

                    Comments.handleCallback(callback, count);
                });
            },
            set: function(post, count, callback) {
                Comments._sync.ref("/posts/" + post).set({
                    "count": count
                }, function(error) {
                    if (error) {
                        Comments.handleError(error);
                        Comments.handleCallback(callback, false);
                    } else {
                        Comments.handleCallback(callback, true);
                    }
                });
            },
            updateCallback(post, callback) {
                var returnCallback = Comments._sync.ref("/posts/" + post);
                returnCallback.on("value", function(snapshot) {
                    var count = 0;
                    if (snapshot && snapshot.val() && snapshot.val().count) {
                        count = snapshot.val().count
                    }

                    Comments.handleCallback(callback, count);
                });
                return returnCallback;
            }
        }
    }
}