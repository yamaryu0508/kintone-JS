/*
 * galleria連携のサンプルプログラム
 * Copyright (c) 2014 Ryu Yamashita, Nishimu
 * 
 */
(function () {

    "use strict";
    
    function loadJS(src) {
        document.write('<script type="text/javascript" src="' + src + '"></script>');
    }

    loadJS('https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js');
    loadJS('https://cdn.jsdelivr.net/galleria/1.3.5/galleria.min.js');

    kintone.events.on('app.record.index.show', function(event){

	    $(".gaia-ui-actionmenu-left li:eq(3), .gaia-ui-actionmenu-left li:eq(4)").hide();
        //var elSpace = $('.box-inner-gaia').get(0);
        var elSpace = kintone.app.getHeaderSpaceElement();
        var check = document.getElementsByName ('container');
        if(check.length !== 0){ return; }
        var elSlide = document.createElement('div');
        elSlide.style.width = 'auto';
        elSlide.style.height = window.innerHeight*0.85 + 'px';        
        elSlide.style.marginRight = '26px';
        elSlide.setAttribute('id', 'container' );
        elSlide.setAttribute('name', 'container' );
        elSlide.setAttribute('class', 'container' );
        //elSpace.appendChild(elSlide);
        elSpace.insertBefore(elSlide, elSpace.firstChild);

        Galleria.loadTheme('https://cdn.jsdelivr.net/galleria/1.3.5/themes/classic/galleria.classic.js');

        var records = event.records;
        var data = [];
        for(var i=0; i<records.length; i++){
            var r = records[i];
            var obj = {
                title: r['title']['value'],
                description: r['description']['value'],
                image: r['image']['value'],
                thumb: (function(){
                    if(r['thumb']['value']){
                        return r['thumb']['value'];
                    } else {
                        return r['image']['value'];
                    }
                })()
            }
            data.push(obj);
        } // for i

        $('#container').galleria({
            dataSource: data
        });

        Galleria.ready(function() {
            var gallery = this;
            this.addElement('fscr');
            this.appendChild('stage','fscr');
            var fscr = this.$('fscr')
                .click(function() {
                    gallery.toggleFullscreen();
                });
            this.addIdleState(this.get('fscr'), { opacity:0 });
        });
        
    }); // kintone.events 
})();