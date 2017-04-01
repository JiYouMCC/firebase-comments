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
      ".indexOn": ["post", "timestamp"],
      "$commentid": {
        ".write": "!data.exists() && newData.hasChild('name') && newData.hasChild('email') && newData.hasChild('post') && newData.hasChild('comment')",
        ".validate": "newData.child('name').val().length > 0 && newData.child('name').val().length < 20 && newData.child('name').isString() && newData.child('email').val().matches(/^[\\.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$/) && newData.child('post').val().length > 0 && newData.child('comment').val().length > 0 && newData.child('comment').val().length < 2048 && newData.child('comment').isString() && newData.child('timestamp').isNumber() && (!newData.hasChild('url') || newData.child('url').val().matches(/^http(s?):\\/\\/[0-9a-zA-Z]([-.\\w]*[0-9a-zA-Z])*((0-9)*)*(\\/?)([a-zA-Z0-9\\-\\.\\?\\,\\'\\/\\\\+&=%\\$#_]*)?$/))"
      }
    },
    "posts": {
      // the path format depends on your own jekyll permalink setting
      "$year":{
        "$month":{
          "$day":{
            "$title":{
              ".write": "newData.hasChild('count')",
              ".validate": "newData.child('count').isNumber() && newData.child('count').val() >= 0"
            }
          }
        }
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

- Comments.handleError(error)
- Comments.errors
- Comments.comment.list(post, callback)
- Comments.comment.listCallback(post, callback)
- Comments.comment.add(name, email, post, comment, url, reply, callback)
- Comments.comment.recent.get(count, callback)
- Comments.comment.recent.updateCallback(count, callback)
- Comments.comment.recent.removeCallback()
- Comments.post.commentCount.get(post, callback)
- Comments.post.commentCount.set(post, count, callback)
- Comments.post.commentCount.updateCallback(post, callback)

Example:
[comments.html](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/docs/_includes/comments.html)

[latest-comments.html](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/docs/_includes/latest-comments.html)




