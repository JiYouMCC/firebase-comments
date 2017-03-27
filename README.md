# Jekyll Commnets using firebase/wilddog #

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


