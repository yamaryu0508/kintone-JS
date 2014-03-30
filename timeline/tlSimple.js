/*
* Timeline JS of development
* Copyright (c) 2014 Ryu Yamashita
* MIT License
*/

(function () {
 
    "use strict";
    
    function loadCSS(href) {
        document.write('<link rel="stylesheet" type="text/css" href="' + href + '" />');
    }
 
    function loadJS(src) {
        document.write('<script type="text/javascript" src="' + src + '"></script>');
    }
 
    function getElementText(element) {
        if(element){
            if (element.textContent !== undefined) {
                return element.textContent;
            } else if (element.innerText !== undefined) {
                return element.innerText;
            }
        }else{
            return "";
        }
    }

    function generateTL(ev, element, title){
 
        var records = ev.records;
        var elName = kintone.app.getFieldElements('name');
        var date = [];

        for (var i = 0; i < records.length; i++) {
            var r = records[i];
            var obj = {
                startDate: (function(){
                    var startDate = r['startDate']['value'];
                    return startDate.toString().split("-").join(",");
                })(),
                endDate: (function(){
                    var endDate = r['endDate']['value'];
                    return endDate.toString().split("-").join(",");
                })(),
                headline: r['headline']['value'],
                text: r['text']['value'],
                tag: r['tag']['value'],
                classname: r['classname']['value'],
                asset: {
                    media: r['media']['value'],
                    thumbnail: r['thumbnail']['value'],
                    credit: r['credit']['value'],
                    caption: r['caption']['value']
                }
            }
            date.push(obj);
        } // for i

        var data = {
            timeline: {
                headline: title['headline'],
                type: title['type'],
                text: title['text'],
                asset: title['asset'],
                date: date
            }
        };

        createStoryJS({
            type: 'timeline',
            width: 'auto',
            height: 'auto',
            source: data,
            embed_id: element
        });
    }

    loadJS('https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js');
    loadJS('https://s3.amazonaws.com/cdn.knightlab.com/libs/timeline/latest/js/timeline-min.js');
    loadJS('https://s3.amazonaws.com/cdn.knightlab.com/libs/timeline/latest/js/storyjs-embed.js');
    loadCSS('https://s3.amazonaws.com/cdn.knightlab.com/libs/timeline/latest/css/timeline.css');
 
    kintone.events.on(['app.record.index.show'], function(event){

        //var elSpace = kintone.app.getHeaderSpaceElement();
        var elSpace = document.getElementsByClassName('box-inner-gaia')[0]; 
        var check = document.getElementsByName ('container');
        if(check.length !== 0){ return; }
        var elTimeLine = document.createElement('div');
        elTimeLine.style.width = '100%';
        elTimeLine.style.height = window.innerHeight*0.85 + 'px';
        elTimeLine.style.marginRight = '26px';
        elTimeLine.style.border = 'solid 1px #ccc';
        elTimeLine.setAttribute('id', 'container' );
        elTimeLine.setAttribute('name', 'container' );
        elTimeLine.setAttribute('class', 'container' );
        //elSpace.appendChild(elTimeLine);
        elSpace.insertBefore(elTimeLine, elSpace.firstChild);

        var mediaUrl="";
        var appUrl = kintone.api.url('/k/v1/records') + '?app='+ kintone.app.getId() + '&query=' + encodeURI('limit 1&fields[0]=media');
        var xmlHttp;
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", appUrl, false);
        xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
        xmlHttp.send(null);
        if (xmlHttp.status == 200){
            var resObj = JSON.parse(xmlHttp.responseText);
            if(resObj['records'].length){
                mediaUrl=resObj['records'][0]['media']['value'];
            }else{
                mediaUrl="";
            }
        } else{
            mediaUrl="";
        }

        var elTitle = document.getElementsByClassName('app-info-name-gaia')[0];
        var elContent = document.getElementsByClassName('app-info-content-gaia')[0];
        var title = {
            type: "default",
            headline: getElementText(elTitle),
            text:  (function(){
                if( getElementText(elContent) =="" ){
                    return "Please enter App description !";
                }else{
                    return getElementText(elContent);
                }
            })(),
            asset: {            
                media: mediaUrl,
                credit: "",
                caption: ""
            }
        };

        generateTL(event, 'container', title);
                    
     });
  
})();