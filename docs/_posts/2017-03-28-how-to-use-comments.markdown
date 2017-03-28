---
layout: post
title:  "How to Use Comments"
date:   2017-03-28 12:31:11 +0800
---

# Steps #
0 Create account of firebase/wilddog, open Email auth. Add rule:
{% highlight json %}
{
  "rules": {
    ".read": true,
        "comments": {
            ".indexOn": ["pid", "date"],
            "$comment":{              
              ".write": "!data.exists()",
              ".validate": "newData.child('uid').val() == auth.uid"              
            }
        }
    }
}
{% endhighlight %}
1 Copy [comments.js](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/js/comments.js) to /js. Of course, you can do something like:
    - Minify javascripts
    - Translate error messages:
{% highlight javascript %}
errors: {
    ALREADY_LOGED_IN: "已经处于登录状态。",
    NOT_LOGIN: "没有登录。",
    DISPLAYNAME_CAN_NOT_BLANK: "昵称不能为空",
    DISPLAYNAME_TOO_LONG: "昵称太长了",
    POSTID_CAN_NOT_BLANK: "文章ID不能为空",
},
{% endhighlight %}
2 Create files such as comments.html and latest-comments.html and modify index.html and post.html as you like.
Example:

1) import js of firebase/wilddog and comment.js

if use firebase:
{% highlight html %}
<script src="https://www.gstatic.com/firebasejs/3.7.3/firebase.js"></script>
<script src="{{ site.baseurl }}/js/comments.min.js"></script>
{% endhighlight %}

if use wilddog:
{% highlight html %}
<script src="https://cdn.wilddog.com/sdk/js/2.5.2/wilddog.js"></script>
<script src="{{ site.baseurl }}/js/comments.min.js"></script>
{% endhighlight %}

2) init

if use firebase
{% highlight javascript %}
<script type="text/javascript">
  //firebase
  var config = {
    apiKey: "*******",
    authDomain: "*******.firebaseapp.com",
    databaseURL: "https://*******.firebaseio.com",
    storageBucket: "*******.appspot.com",
    messagingSenderId: "*******"
  };
  Comments.init("firebase",config);
</script>
{% endhighlight %}

if use wilddog
{% highlight javascript %}
<script type="text/javascript">
  //Wilddog
  var config = {
    authDomain: "*******.wilddog.com",
    syncURL: "https://*******.wilddogio.com"
  };
  Comments.init("wilddog",config);
</script>
{% endhighlight %}

3) Code your own js as you like using functions:

- Comments.handleError
- Comments.errors
- Comments.user.get()
- Comments.user.register(email, password, callback)
- Comments.user.login(email, password, callback)
- Comments.user.logout()
- Comments.user.displayName.get()
- Comments.user.displayName.set(displayName, callback)
- Comments.user.updateCallback(callback)
- Comments.comment.list(postId, callback)
- Comments.comment.listCallback(postId, callback)
- Comments.comment.add(postId, message, parentCommentId, url, callback)
- Comments.comment.recent.get(count, callback)
- Comments.comment.recent.updateCallback(count, callback)
- Comments.comment.recent.removeCallback()

Example:
[comments.html](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/docs/_includes/comments.html)

[latest-comments.html](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/docs/_includes/latest-comments.html)




