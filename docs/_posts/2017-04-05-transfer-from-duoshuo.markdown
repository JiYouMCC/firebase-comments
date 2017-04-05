---
layout: post
title:  "Transfer from Duoshuo"
date:   2017-04-05 16:49:00 +0800
---
<textarea style="width: 100%;height: 300px;" id="source_json"></textarea>
<button onclick="document.getElementById('result_json').value = JSON.stringify(Comments.comment.convertFromDuoshuo(document.getElementById('source_json').value))">Transfer</button>
<textarea style="width: 100%;height: 300px;" id="result_json" disabled=""></textarea>