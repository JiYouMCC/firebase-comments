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
    formatDate: function(date) {
        return date.getFullYear() + "-" +
            ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("0" + date.getDate()).slice(-2) + " " +
            ("0" + date.getHours()).slice(-2) + ":" +
            ("0" + date.getMinutes()).slice(-2) + ":" +
            ("0" + date.getSeconds()).slice(-2) + " ";
    },
    errors: {
        NO_POST: "没有指定文章",
        NO_NAME: "昵称为空",
        NAME_TOO_LONG: "昵称太长",
        NO_EMAIL: "邮件地址为空",
        EMAIL_INVALD: "邮件地址无效",
        URL_INVALD: "网址无效",
        NO_COMMENT: "评论为空",
        COMMENT_TOO_LONG: "评论太长",
        NO_COUNT: "没有指定数量"
    },
    handleCallback: function(callback, returnValue) {
        if (callback) {
            callback(returnValue)
        }
    },
    _convertDicToSortedArray: function(comments) {
        // order by timestamp
        var commentsArray = []
        for (commentId in comments) {
            var comment = comments[commentId];
            comment["id"] = commentId;
            commentsArray.push(comment);
        }

        commentsArray.sort(function(comment1, comment2) {
            return comment1.timestamp > comment2.timestamp
        });
        return commentsArray;
    },
    comment: {
        list: function(post, callback) {
            // TODO pagenation
            if (post) {
                Comments._sync.ref("/comments").orderByChild("post").equalTo(post).once("value", function(snapshot) {
                    Comments.handleCallback(callback, Comments._convertDicToSortedArray(snapshot.val()));
                });
            } else {
                Comments.handleError(Comments.errors.NO_POST);
                Comments.handleCallback(callback, undefined);
            }
        },
        listCallback: function(post, callback) {
            if (post) {
                var returnCallback = Comments._sync.ref("/comments").orderByChild("post").equalTo(post);
                returnCallback.on("value", function(snapshot) {
                    Comments.handleCallback(callback, Comments._convertDicToSortedArray(snapshot.val()));
                });
                return returnCallback;
            } else {
                Comments.handleError(Comments.errors.POSTID_CAN_NOT_BLANK);
                Comments.handleCallback(callback, undefined);
            }
        },
        add: function(name, email, post, comment, url, reply, callback) {
            if (!name) {
                Comments.handleError(Comments.errors.NO_NAME);
                Comments.handleCallback(callback, false);
                return;
            }

            if (name.length > 20) {
                Comments.handleError(Comments.errors.NAME_TOO_LONG);
                Comments.handleCallback(callback, false);
                return;
            }

            if (!email) {
                Comments.handleError(Comments.errors.NO_EMAIL);
                Comments.handleCallback(callback, false);
                return;
            }

            if (!/^[\.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email)) {
                Comments.handleError(Comments.errors.EMAIL_INVALD);
                Comments.handleCallback(callback, false);
                return;
            }

            if (!post) {
                Comments.handleError(Comments.errors.NO_POST);
                Comments.handleCallback(callback, false);
                return;
            }

            if (url && !/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(url)) {
                Comments.handleError(Comments.errors.URL_INVALD);
                Comments.handleCallback(callback, false);
                return;
            }

            if (!comment) {
                Comments.handleError(Comments.errors.NO_COMMENT);
                Comments.handleCallback(callback, false);
                return;
            }

            if (comment.length >= 2048) {
                Comments.handleError(Comments.errors.COMMENT_TOO_LONG);
                Comments.handleCallback(callback, false);
                return;
            }

            Comments.post.commentCount.get(post, function(oldResult) {
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
                        Comments.post.commentCount.set(post, oldResult.count + 1, function() {
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

                    Comments.handleCallback(callback, Comments._convertDicToSortedArray(snapshot.val()));
                });
            },
            updateCallback: function(count, callback) {
                Comments.comment.recent.removeCallback();
                Comments.comment._callback = Comments._sync.ref("/comments").orderByChild("timestamp").limitToLast(count);
                Comments.comment._callback.on("value", function(snapshot) {
                    Comments.handleCallback(callback, Comments._convertDicToSortedArray(snapshot.val()));
                });
            },
            removeCallback: function() {
                if (Comments.comment._callback) {
                    Comments.comment._callback.remove();
                    Comments.comment._callback = undefined;
                }
            }
        },
        convertFromDuoshuo: function(source) {
            var source = JSON.parse(source);
            var result = {
                "comments": {}
            };
            var target = result.comments;
            for (var i = 0; i < source.posts.length; i++) {
                var source_comment = source.posts[i];
                var result_comment = {};
                result_comment.name = source_comment.author_name;
                result_comment.email = source_comment.author_email;
                if (source_comment.author_url) {
                    result_comment.url = source_comment.author_url;
                }

                result_comment.post = source_comment.thread_key;
                result_comment.timestamp = parseInt(new Date(source_comment.created_at).getTime());
                result_comment.comment = source_comment.message;
                target[source_comment.post_id] = result_comment;
            }

            return (result);
        },
        transferFromDuoShuo: function(source, callback) {
            var sourceJson = Comments.comment.convertFromDuoshuo(source)
            Comments._sync.ref("/comments").update(sourceJson.comments, function(error) {
                if (error) {
                    Comments.handleError(error);
                    Comments.handleCallback(callback, false);
                } else {
                    Comments.post.commentCount.check(function(result) {
                        if (result) {
                            Comments.handleCallback(callback, true);
                        }
                    })
                }
            });
        }
    },
    post: {
        commentCount: {
            get: function(post, callback) {
                if (!post) {
                    Comments.handleError(Comments.errors.NO_POST);
                    Comments.handleCallback(callback, null);
                    return;
                }

                Comments._sync.ref("/posts/" + post).once("value", function(snapshot) {
                    var count = 0;
                    if (snapshot && snapshot.val() && snapshot.val().count) {
                        count = snapshot.val().count
                    }

                    Comments.handleCallback(callback, {
                        "post": post,
                        "count": count
                    });
                });
            },
            set: function(post, count, callback) {
                if (!post) {
                    Comments.handleError(Comments.errors.NO_POST);
                    Comments.handleCallback(callback, false);
                    return;
                }

                if (!count) {
                    Comments.handleError(Comments.errors.NO_COUNT);
                    Comments.handleCallback(callback, false);
                    return;
                }

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
            updateCallback: function(post, callback) {
                if (!post) {
                    Comments.handleError(Comments.errors.NO_POST);
                    Comments.handleCallback(callback, null);
                    return;
                }

                var returnCallback = Comments._sync.ref("/posts/" + post);
                returnCallback.on("value", function(snapshot) {
                    var count = 0;
                    if (snapshot && snapshot.val() && snapshot.val().count) {
                        count = snapshot.val().count
                    }

                    Comments.handleCallback(callback, {
                        "post": post,
                        "count": count
                    });
                });
                return returnCallback;
            },
            check: function(callback) {
                // please allow posts .write: true
                Comments._sync.ref("/comments").once("value", function(snapshot) {
                    if (!snapshot) {
                        Comments.handleCallback(callback, false);
                        return true;
                    }

                    var comments = snapshot.val();
                    var commentCount = {};

                    for (commentId in comments) {
                        var comment = comments[commentId];
                        var postPath = comment.post.split("/");
                        for (var j = 0; j < postPath.length;) {
                            var path = postPath[j];
                            if (path == "") {
                                postPath.splice(j, 1);
                            } else {
                                j++;
                            }
                        }

                        var target = commentCount;
                        for (var j = 0; j < postPath.length; j++) {
                            var path = postPath[j].toString();
                            if (!target[path]) {
                                target[path] = {}
                            }
                            target = target[path];
                        }

                        if (target["count"]) {
                            target["count"] = target["count"] + 1;
                        } else {
                            target["count"] = 1;
                        }
                    }

                    Comments._sync.ref("/posts").set(commentCount, function(error) {
                        if (error) {
                            Comments.handleError(error);
                            Comments.handleCallback(callback, false);
                        } else {
                            Comments.handleCallback(callback, true);
                        }
                    });
                });
            }
        }
    }
}