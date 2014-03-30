/*
* Copyright (c) 2014 Ryu Yamashita
* MIT License
*/
(function () {
 
    "use strict";
    
    function loadJS(src) {
        document.write('<script type="text/javascript" src="' + src + '"></script>');
    }

    function appendEventListener(element, type, func) {
        if (element.addEventListener !== undefined) {
            element.addEventListener(type, func, false);
        } else if (element.attachEvent !== undefined) {
            element.attachEvent('on' + type, func);
        }
    }

    function showDetailMap(event){
        var r = event.record;
    
        var elLocation = document.getElementsByClassName('layout-gaia')[0];
        if (!elLocation) { return; }

        var elMap = document.createElement('div');
        elMap.setAttribute('id', 'mapSpace');
        elMap.setAttribute('name', 'mapSpace');
        
        elLocation.appendChild(elMap);

        elMap.setAttribute('style', 'width: auto; height: 250px');

        var latlng = new OpenLayers.LonLat(r['lon']['value'], r['lat']['value'])
            .transform(
                new OpenLayers.Projection("EPSG:4326"), 
                new OpenLayers.Projection("EPSG:900913")
        );

        var map = new OpenLayers.Map("mapSpace");
        var mapnik = new OpenLayers.Layer.OSM();
        map.addLayer(mapnik);
    
        map.setCenter(latlng, 15);
    
        var markers = new OpenLayers.Layer.Markers("Markers");
        map.addLayer(markers);
        var iconUrl = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + '' + '|FAFA00|000000';
        var size = new OpenLayers.Size(20, 28);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        var icon = new OpenLayers.Icon(iconUrl, size, offset);
        var marker = new OpenLayers.Marker(
        new OpenLayers.LonLat(r['lon']['value'], r['lat']['value'])
            .transform(
                    new OpenLayers.Projection("EPSG:4326"), 
                    new OpenLayers.Projection("EPSG:900913")
            ), 
            icon
        );
        markers.addMarker(marker);

    }
    
    function reloadPositionFromAddress(event) {
        var check = document.getElementsByName('reloadAddress');
        if (check.length == 0) {
            var txt = document.createTextNode("Update position by address");

            var button = document.createElement("button");
            button.appendChild(txt);
            button.setAttribute("name", "reloadAddress");

            var span = document.createElement("span");
            span.appendChild(button);

            var label = document.getElementsByClassName('value-137231')[0];
            label.appendChild(span);
            
            appendEventListener(button, 'click', function () {
                var address = document.getElementsByClassName('value-137231');
                var addressInput = address[0].getElementsByTagName('input');
                var gc = new google.maps.Geocoder(); 
                gc.geocode({
                    address: addressInput[0].value,
                    language: 'ja',
                    country: 'JP'
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var lat = document.getElementsByClassName('value-137232');
                        var latInput = lat[0].getElementsByTagName('input');
                        latInput[0].value = results[0].geometry.location.lat();        
                        var lng = document.getElementsByClassName('value-137233');
                        var lngInput = lng[0].getElementsByTagName('input');
                        lngInput[0].value = results[0].geometry.location.lng();                    
                    }
                });
            });
        }
    }

    loadJS('https://maps-api-ssl.google.com/maps/api/js?v=3&sensor=false');
    loadJS('https://cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/OpenLayers.js');

    kintone.events.on(['app.record.create.show', 'app.record.edit.show'], reloadPositionFromAddress);
    kintone.events.on('app.record.detail.show', showDetailMap);

})();