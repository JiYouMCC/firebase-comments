# Jekyll Comments using firebase/wilddog #

Demo: http://www.jithee.name/jekyll-firebase-comments

## To do list
- verify by number/sth like that
- 500 limit
- change to Promise

## comments json format ##

    {
      "comments" : {
        "-KgccDhWMR14MzcFoKnU" : {
          "comment" : "Hello World",
          "email" : "nightghostjiyou@gmail.com",
          "name" : "JiYouMCC",
          "post" : "/2017/03/29/to-do-list",
          "timestamp" : 1491035286677
        },
        "-KgccIGBbwzwFVXwhrN_" : {
          "comment" : "Reply Hello World",
          "email" : "nightghostjiyou@gmail.com",
          "name" : "JiYouMCC",
          "post" : "/2017/03/29/to-do-list",
          "reply" : "-KgccDhWMR14MzcFoKnU",
          "timestamp" : 1491035305348
        },
        "-KgccPJQhA0dJkti49la" : {
          "comment" : "How to use it",
          "email" : "nightghostjiyou@gmail.com",
          "name" : "JiYouMCC",
          "post" : "/2017/03/28/how-to-use-comments-cn",
          "timestamp" : 1491035334230
        }
      },
      "posts" : {
        "2017" : {
          "03" : {
            "28" : {
              "how-to-use-comments-cn" : {
                "count" : 1
              }
            },
            "29" : {
              "to-do-list" : {
                "count" : 2
              }
            }
          }
        }
      }
    }


## Database Rule ##

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


