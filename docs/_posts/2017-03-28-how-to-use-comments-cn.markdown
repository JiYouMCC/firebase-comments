---
layout: post
title:  "怎么用评论"
date:   2017-03-28 13:09:20 +0800
---
这个也是个造轮子的工作，github上面我已经有人这么做过了： [mimming/firebase-jekyll-comments](https://github.com/mimming/firebase-jekyll-comments) 不过我还是自己写了一写


# 步骤 #
0 新建一个firebase或者野狗的账号，国内因为众所周知的原因firebase用不了，基本上都拿野狗举例子了。打开邮箱登录选项，给访问权限加规则如下：
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

1 复制 [comments.js](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/js/comments.js) 到js文件夹或者其他任何你找得到地方。你还可以做一点类似于下面这种事儿
    - 把js给混淆了
    - 把error message翻译成你喜欢的语言或者文字
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
2 在includes里面或者layouts里面新建html文件，反正看你怎么用jekyll了

1) 引用firebase/wilddog的js 和 comment.js

firebase:
{% highlight html %}
<script src="https://www.gstatic.com/firebasejs/3.7.3/firebase.js"></script>
<script src="{{ site.baseurl }}/js/comments.min.js"></script>
{% endhighlight %}

wilddog:
{% highlight html %}
<script src="https://cdn.wilddog.com/sdk/js/2.5.2/wilddog.js"></script>
<script src="{{ site.baseurl }}/js/comments.min.js"></script>
{% endhighlight %}

2) 初始化

firebase:
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

wilddog:
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

3) 用这堆函数编你自己的js代码，我demo就没用jquery，其他的随便

- Comments.handleError(error) 可以重写handleError 比如跳个模态框啊 message box什么的
- Comments.errors 可以翻译或者改写什么的
- Comments.comment.list(post, callback) 获取某个post的所有评论
- Comments.comment.listCallback(post, callback) 监听某个post的所有评论
- Comments.comment.add(name, email, post, comment, url, reply, callback) 添加评论
- Comments.comment.recent.get(count, callback) 获取最近的count条评论
- Comments.comment.recent.updateCallback(count, callback) 监听最近的count条评论
- Comments.comment.recent.removeCallback() 关闭监听count评论的
- Comments.post.commentCount.get(post, callback) 获取某个post的条数
- Comments.post.commentCount.set(post, count, callback) 设置某个post的条数（这个目前还是内部使用）
- Comments.post.commentCount.updateCallback(post, callback) 监听某个post的条数

callback就不要吐槽了，懒得改成Promise，以后再说

如果要更多的方法自己可以去comments.js里面加

栗子:

[comments.html](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/docs/_includes/comments.html)

[latest-comments.html](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/docs/_includes/latest-comments.html)




