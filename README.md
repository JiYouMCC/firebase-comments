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
            commentId : {
                date: timestamp,
                uid:XXX,
                uname: XXX,
                uurl: XXX,
                pid:XXX,
                msg: XXXXX,
                pcid:XXX
            }
        }
    }

## Database Rule ##

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


