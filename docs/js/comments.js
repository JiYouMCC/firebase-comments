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
        list: function(postId, callback) {
            // TODO pagenation
            if (postId) {
                Comments._sync.ref("/comments").orderByChild("post").equalTo(postId).once("value", function(snapshot) {
                    Comments.handleCallback(callback, snapshot.val());
                });
            } else {
                Comments.handleError(Comments.errors.POSTID_CAN_NOT_BLANK);
                Comments.handleCallback(callback, undefined);
            }
        },
        listCallback: function(postId, callback) {
            if (postId) {
                var returnCallback = Comments._sync.ref("/comments").orderByChild("post").equalTo(postId);
                returnCallback.on("value", function(snapshot) {
                    callback(snapshot.val());
                });
                return returnCallback;
            } else {
                Comments.handleError(Comments.errors.POSTID_CAN_NOT_BLANK);
                Comments.handleCallback(callback, undefined);
            }
        },
        add: function(name, email, postId, comment, url, reply, callback) {
            Comments.post.commentCount.get(postId, function(Oldcount) {
                var commentRef = Comments._sync.ref("/comments");
                commentRef.push({
                    "name": name,
                    "email": email,
                    "post": postId,
                    "timestamp": Comments._timestamp,
                    "comment": comment,
                    "url": url,
                    "reply": reply
                }).catch(function(error) {
                    Comments.handleError(error);
                    Comments.handleCallback(callback, undefined);
                }).then(
                    function() {
                        Comments.post.commentCount.set(postId, Oldcount + 1, function() {
                            Comments.handleCallback(callback, true);
                        });
                    }
                );
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
        allowComment: function(postId, callback) {

        },
        commentCount: {
            get: function(postId, callback) {
                Comments._sync.ref("/posts/" + postId).once("value", function(snapshot) {
                    var count = 0;
                    if (snapshot && snapshot.val() && snapshot.val().commentCount) {
                        count = snapshot.val().commentCount;
                    }

                    Comments.handleCallback(callback, count);
                });
            },
            set: function(postId, count, callback) {
                Comments._sync.ref("/posts/" + postId + "/commentCount").set(count, function(error) {
                    if (error == null) {
                        Comments.handleCallback(callback, true)
                    } else {
                        Comments.handleCallback(callback, false)
                        Comments.handleError(error);
                    }
                });
            }
        },
        commentCountCallback: function(postId, callback) {
            var returnCallback = Comments._sync.ref("/posts/" + postId)
            returnCallback.on("value", function(snapshot) {
                var count = 0;
                if (snapshot && snapshot.val() && snapshot.val().commentCount) {
                    count = snapshot.val().commentCount;
                }

                Comments.handleCallback(callback, count);
            });
            return returnCallback;
        }
    }
}