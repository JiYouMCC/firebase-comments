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
        ALREADY_LOGED_IN: "已经处于登录状态。",
        NOT_LOGIN: "没有登录。",
        DISPLAYNAME_CAN_NOT_BLANK: "昵称不能为空",
        DISPLAYNAME_TOO_LONG: "昵称太长了",
        POSTID_CAN_NOT_BLANK: "文章ID不能为空",
    },
    handleCallback: function(callback, returnValue) {
        if (callback) {
            callback(returnValue)
        }
    },
    user: {
        get: function() {
            return Comments._auth.currentUser;
        },
        register: function(email, password, callback) {
            var user = Comments.user.get();
            if (!user) {
                Comments._auth.createUserWithEmailAndPassword(email, password).then(function(user) {
                    Comments.handleCallback(callback, user);
                }).catch(function(error) {
                    Comments.handleError(error);
                    Comments.handleCallback(callback, undefined);
                });
            } else {
                Comments.handleError(Comments.errors.ALREADY_LOGED_IN);
                Comments.handleCallback(callback, undefined);
            }
        },
        login: function(email, password, callback) {
            var user = Comments.user.get();
            if (!user) {
                Comments._auth.signInWithEmailAndPassword(email, password).then(function(user) {
                    Comments.handleCallback(callback, user);
                }).catch(function(error) {
                    Comments.handleError(error);
                    Comments.handleCallback(callback, undefined);
                });
            } else {
                Comments.handleError(Comments.errors.ALREADY_LOGED_IN);
                Comments.handleCallback(callback, undefined);
            }
        },
        logout: function() {
            var user = Comments.user.get();
            if (user) {
                Comments._auth.signOut().catch(function(error) {
                    findghost.handleError(error);
                });
            } else {
                Comments.handleError(Comments.errors.NOT_LOGIN);
            }
        },
        displayName: {
            get: function(user) {
                if (!user) {
                    var user = Comments.user.get();
                }
                if (user) {
                    var name = user.displayName;
                    return name ? name : user.email.split('@')[0];
                }
            },
            set: function(displayName, callback) {
                if (displayName.length <= 0) {
                    Comments.handleError(Comments.errors.DISPLAYNAME_CAN_NOT_BLANK);
                    Comments.handleCallback(callback, undefined);
                    return;
                }

                if (displayName.length > 10) {
                    Comments.handleError(Comments.errors.DISPLAYNAME_TOO_LONG);
                    return;
                }
                var user = Comments.user.get();
                if (user) {
                    var oldDisplay = Comments.user.displayName.get();
                    Comments._auth.currentUser.updateProfile({
                        displayName: displayName
                    }).then(function(displayName) {
                        Comments.handleCallback(callback, displayName);
                    }).catch(function(error) {
                        Comments.handleCallback(callback, undefined);
                        Comments.handleError(error);
                    });
                }
            }
        },
        updateCallback: function(callback) {
            Comments._auth.onAuthStateChanged(callback);
        }
    },
    comment: {
        list: function(postId, callback) {
            // TODO pagenation
            if (postId) {
                Comments._sync.ref("/comments").orderByChild("pid").equalTo(postId).once("value", function(snapshot) {
                    Comments.handleCallback(callback, snapshot.val());
                });
            } else {
                Comments.handleError(Comments.errors.POSTID_CAN_NOT_BLANK);
                Comments.handleCallback(callback, undefined);
            }
        },
        listCallback: function(postId, callback) {
            if (postId) {
                var returnCallback = Comments._sync.ref("/comments").orderByChild("pid").equalTo(postId);
                returnCallback.on("value", function(snapshot) {
                    callback(snapshot.val());
                });
                return returnCallback;
            } else {
                Comments.handleError(Comments.errors.POSTID_CAN_NOT_BLANK);
                Comments.handleCallback(callback, undefined);
            }
        },
        add: function(postId, message, parentCommentId, url, callback) {
            var user = Comments.user.get();
            if (user) {
                var commentRef = Comments._sync.ref("/comments");
                commentRef.push({
                    "date": Comments._timestamp,
                    "uid": user.uid,
                    "uname": Comments.user.displayName.get(),
                    "uurl": url,
                    "pid": postId,
                    "msg": message,
                    "pcid": parentCommentId
                }).catch(function(error) {
                    Comments.handleError(error);
                    Comments.handleCallback(callback, undefined);
                });
                Comments.handleCallback(callback, true);
            } else {
                Comments.handleCallback(callback, undefined);
                Comments.handleError(Comments.errors.NOT_LOGIN);
            }
        },
        recent: {
            _callback: undefined,
            get: function(count, callback) {
                if (!count) {
                    count = 10
                }

                Comments._sync.ref("/comments").orderByChild("date").limitToLast(count).once("value", function(snapshot) {
                    Comments.handleCallback(callback, snapshot.val());
                });
            },
            updateCallback: function(count, callback) {
                Comments.comment.recent.removeCallback();
                Comments.comment._callback = Comments._sync.ref("/comments").orderByChild("date").limitToLast(count);
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
    }
}