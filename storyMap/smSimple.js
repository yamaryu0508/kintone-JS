/*
* StoryMap JS of development
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

    function generateMap(ev, element, overview){
 
        var records = ev.records;
        var elName = kintone.app.getFieldElements('name');
        var slides = [];
        slides.push(overview);

        for (var i = 0; i < records.length; i++) {
            var r = records[i];
            var obj = {
                date: r['date']['value'],
                text: {
                    headline: r['headline']['value'],
                    text: r['text']['value']
                },
                location: {
                    name: r['name']['value'],
                    lat: r['lat']['value'],
                    lon: r['lon']['value'],
                    zoom: r['zoom']['value'],
                    line: r['line']['value']
                },
                media: {
                    url: r['url']['value'],
                    credit: r['credit']['value'],
                    caption: r['caption']['value']
                }
            }
            slides.push(obj);
        } // for i
        
        var data = {
            storymap:{
                slides: slides
            }
        }        
        var storyMap = new VCO.StoryMap(element, data);
        window.onresize = function(event) {
            storyMap.updateDisplay(); // this isn't automatic
        }
    }

     loadJS("https://s3.amazonaws.com/cdn.knightlab.com/libs/storymapjs/latest/js/storymap-min.js");
     loadCSS("https://s3.amazonaws.com/cdn.knightlab.com/libs/storymapjs/latest/css/storymap.css");
 
    kintone.events.on(['app.record.index.show'], function(event){

        //var elSpace = kintone.app.getHeaderSpaceElement();
        var elSpace = document.getElementsByClassName('box-inner-gaia')[0]; 
        var check = document.getElementsByName ('container');
        if(check.length !== 0){ return; }
        var elStoryMap = document.createElement('div');
        elStoryMap.style.width = '100%';
        elStoryMap.style.height = window.innerHeight*0.85 + 'px';        
        elStoryMap.style.marginRight = '26px';
        elStoryMap.style.border = 'solid 1px #ccc';
        elStoryMap.setAttribute('id', 'container' );
        elStoryMap.setAttribute('name', 'container' );
        elStoryMap.setAttribute('class', 'container' );
        //elSpace.appendChild(elStoryMap);
        elSpace.insertBefore(elStoryMap, elSpace.firstChild);

        var mediaUrl="";
        var appUrl = kintone.api.url('/k/v1/records') + '?app='+ kintone.app.getId() + '&query=' + encodeURI('limit 1&fields[0]=url');
        var xmlHttp;
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", appUrl, false);
        xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
        xmlHttp.send(null);
        if (xmlHttp.status == 200){
            var resObj = JSON.parse(xmlHttp.responseText);
            if(resObj['records'].length){
                mediaUrl=resObj['records'][0]['url']['value'];
            }else{
                mediaUrl="";
            }
        } else{
            mediaUrl="";
        }

        var elTitle = document.getElementsByClassName('app-info-name-gaia')[0];
        var elContent = document.getElementsByClassName('app-info-content-gaia')[0];
        var overview = {
            type: "overview",
            text: {
                headline: getElementText(elTitle),
                text:  (function(){
                    if( getElementText(elContent) =="" ){
                        return "Please enter App description !";
                    }else{
                        return getElementText(elContent);
                    }
                })()
            },
            media: {
                url: mediaUrl
            }
        }

        generateMap(event, 'container', overview);
                    
     });
  
})();