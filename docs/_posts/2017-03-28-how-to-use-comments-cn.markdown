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
            ".indexOn": ["pid", "date"],
            "$comment":{              
              ".write": "!data.exists()",
              ".validate": "newData.child('uid').val() == auth.uid"              
            }
        }
    }
}
{% endhighlight %}
你也可以自己在validate加点规则，什么msg不能为空啊什么的，我懒得整了

1 复制 [comments.js](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/js/comments.js) 到js文件夹或者其他任何你找得到地方。你还可以做一点类似于下面这种事儿
    - 把js给混淆了
    - 把error message翻译成你喜欢的语言或者文字
{% highlight javascript %}
errors: {
    ALREADY_LOGED_IN: "已经处于登录状态。",
    NOT_LOGIN: "没有登录。",
    DISPLAYNAME_CAN_NOT_BLANK: "昵称不能为空",
    DISPLAYNAME_TOO_LONG: "昵称太长了",
    POSTID_CAN_NOT_BLANK: "文章ID不能为空",
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

3) 用这堆函数编你自己的js代码，我demo就没用jquery，其他的随便

- Comments.handleError 可以重写handleerror 比如跳个模态框啊 message box什么的
- Comments.errors 可以翻译或者改写什么的
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

callback就不要吐槽了，懒得改

如果要更多的方法自己可以去comments.js里面加

栗子:

[comments.html](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/docs/_includes/comments.html)

[latest-comments.html](https://github.com/JiYouMCC/jekyll-firebase-comments/blob/master/docs/_includes/latest-comments.html)




