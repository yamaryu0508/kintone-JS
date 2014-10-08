/*
 * Doorkeeper→kintone取込みサンプルプログラム
 * Copyright (c) 2014 Ryu Yamashita
 * MIT License
 */
(function () {
    "use strict";

    // グループ名を定義
    var GROUP_NAME = 'kintone-cafe';

    function loadJS(src) {
        document.write('<script type="text/javascript" src="' + src + '"></script>');
    }
 
    function trimTime(time){
        return time.substr(0, 16);
    }
    
    function requestHttp(method, uri, headers, body, type){
        var xmlHttp;
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open(method, uri, type);
        xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
        for(var key in headers){
            xmlHttp.setRequestHeader(key, headers[key]);
        }
        if(body){
            xmlHttp.send(body);
        }else{
            xmlHttp.send(null);
        }
        return xmlHttp;
    }

    loadJS('https://code.jquery.com/jquery-1.8.3.js');
    
    kintone.events.on('app.record.index.show', function(event){
    
        // Doorkeeperに登録済みのイベントが新規ならPOST、更新されていたらPUTしていく
        // 同期処理の必要性等を考慮し、XMLHttpRequestを利用したリクエストを利用する
        
        // Doorkeeperからイベント情報を取得
        var dkGetUri = 'http://api.Doorkeeper.jp/groups/'+ GROUP_NAME +'/events';
        kintone.proxy(dkGetUri,'GET',{},{},function (body, status, headers) {
            if (status === 200){
                var events = JSON.parse(body);
                var countRegisted = 0;
                var countUpdated = 0;
                // Doorkeeperに登録済みのイベントが新規ならPOST、更新されていたらPUTしていく
                for(var i=0; i < events.length; i++) {
                    var event = events[i]['event'];
                    
                    // イベントIDからkintoneレコードを取得
                    var query = 'id = \"' + event["id"] + '\"';
                    var appUrl = kintone.api.url('/k/v1/records') + '?app='+ kintone.app.getId() + '&query=' + encodeURIComponent(query);
                    
                    var getResp = requestHttp("GET", appUrl, {}, {}, false);
                    if(getResp.status != 200){
                        console.log(getResp.responseText);
                        alert("同期処理を中断しました。\n（GETメソッドエラー）");
                        return;
                    }
                    
                    var getJson = JSON.parse(getResp.responseText);

                    var record = {};
                    var existingRecord = getJson['records'][0];
                    // 取得したkintoneレコードが空か否かで、レコード登録か更新かを判断する
                    if(existingRecord){
                        // kintoneレコードにイベントが登録済みで、更新時刻が変更されていたら、レコード更新
                        if(trimTime(existingRecord['updated_at']['value']) !== trimTime(event['updated_at'])){

                            for(var key in event){
                                record[key] = {};
                                record[key]['value'] = event[key];
                            }
                            var obj = {
                                "app" : kintone.app.getId(),
                                "id" : existingRecord['$id']['value'],
                                "record" : record,
                                "__REQUEST_TOKEN__" : kintone.getRequestToken()
                            };
                            var putResp = requestHttp("PUT", kintone.api.url('/k/v1/record'), {"Content-Type":"application/json"}, JSON.stringify(obj), false);
                            if(putResp.status != 200){
                                console.log(putResp.responseText);
                                alert("同期処理を中断しました。\n（PUTメソッドエラー）");
                                return;
                            }
                            countUpdated++;
                        }                        
                    } else {
                        // kintoneレコードにイベントが未登録の場合は、レコード登録
                        for(var key in event){
                            record[key] = {};
                            record[key]['value'] = event[key];
                        }
                        var obj = {
                            "app" : kintone.app.getId(),
                            "record" : record,
                            "__REQUEST_TOKEN__" : kintone.getRequestToken()
                        };
                                                        
                        var postResp = requestHttp("POST", kintone.api.url('/k/v1/record'), {"Content-Type":"application/json"}, JSON.stringify(obj), false);
                        if(postResp.status != 200){
                            console.log(postResp.responseText);
                            alert("同期処理を中断しました。\n（POSTメソッドエラー）");
                            return;
                        }
                        countRegisted++;                        
                    }
                } // for i
                // 登録・更新したレコードの状態を表示（変更時のみ）
                if(countUpdated>0 || countRegisted>0){
                    var elHeaderMenuSpace = kintone.app.getHeaderMenuSpaceElement();
                    $(elHeaderMenuSpace).append('<div id="message" style="margin-top: 5px; font-weight: bold">「新規：'+countRegisted+'件、更新：'+countUpdated+'件」の変更を確認しました。ブラウザのリロードは<a href="" onclick="location.reload(true)">こちら</a>です。</div>');
                }
                console.log("新規：" +countRegisted+"件\n"+"更新："+countUpdated+"件");
            }else{
                console.log("Doorkeeper API connection failed!");
                alert("同期処理を中断しました。\n（GETメソッドエラー）");
            }
        },function (body){
            console.log(body);
            alert("同期処理を中断しました。\n（GETメソッドエラー）");
        });

    }); // kintone.events.on('app.record.index.show')

    kintone.events.on('app.record.detail.show', function(event){
    
        var record = event.record;
        
        // バナーをスペース要素を利用して冒頭に表示
        var elBannerSpace = kintone.app.record.getSpaceElement('bannerSpace');
        $(elBannerSpace).append('<a href="'+record['public_url']['value']+'"><img id ="dk-banner" src="' + event.record['banner']['value'] + '"></img></a>');
        var elBannerSpaceParent = elBannerSpace.parentNode;
        $('#dk-banner').bind('load',function(){
            elBannerSpaceParent.style.height = $('#dk-banner')[0].height+'px';
            elBannerSpaceParent.style.width = $('#dk-banner')[0].width+'px';
        });
        
        // 「イベント内容」がHTMLタグ付きで得られるため、textContentで入れ直す
        var elDescription = kintone.app.record.getFieldElement('description');
        elDescription.innerHTML = '<div class="processed-markdown">' + elDescription.textContent + '</div>';
        var elTable = $(elDescription).find('table')[0];
        console.log(elDescription);
        console.log(elTable);
        // 表示が不要そうなフィールドを非表示にしておく
        kintone.app.record.setFieldShown('lat', false);
        kintone.app.record.setFieldShown('long', false);
        kintone.app.record.setFieldShown('banner', false);
        kintone.app.record.setFieldShown('published_at', false);
        kintone.app.record.setFieldShown('updated_at', false);
        
    }); // kintone.events.on('app.record.detail.show')
 
})();