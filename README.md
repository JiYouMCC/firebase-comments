# Jekyll Comments using firebase/wilddog #

Demo: http://www.jithee.name/jekyll-firebase-comments

## To do list
- guests can leave comments without login
- reply logic
- better setting of rule
- enable to close comment to special post
- gravatar
- verify by number/sth like that
- 500 limit

## comments json format ##

    
    {
        "comments": {
            $commentid : {
                name: "nickname",
                email: "nickname@website.com",
                post: "{{ post id }}",
                timestamp: "{{ timestamp }}",
                comment: "Hello World",
                [url: "url",]
                [reply: "another commentid"]
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


