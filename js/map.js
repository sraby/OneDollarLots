// BASEMAP

 var map = L.map('mainmap', {
    center: [40.716303, -73.940535], 
    zoom: 11,
    zoomControl: false
});

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        maxZoom: 18,
        opacity: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
      }).addTo(map);

// SMOOTH ZOOM: 
/* mapboxgl.accessToken = 'pk.eyJ1IjoiNTk2YWNyZXMiLCJhIjoiY2piNDAyenUxN3h5bjJ3cnoxaWZvZHVxMiJ9.XEq_QixSEwo3wWlFZpmVXg';
var map = new mapboxgl.Map({
    container: 'mainmap',
    style: 'mapbox://styles/mapbox/light-v9'
});
*/

/* MAPBOX DARK

var token = "pk.eyJ1IjoiNTk2YWNyZXMiLCJhIjoiY2piNDAyenUxN3h5bjJ3cnoxaWZvZHVxMiJ9.XEq_QixSEwo3wWlFZpmVXg";

var gl = L.mapboxGL({
    accessToken: token,
    style: 'mapbox://styles/mapbox/dark-v9'
}).addTo(map); 
*/ 

// SYMBOLOGY FUNCTIONS 

function getColor(d) 
    {
        return  d ==     'Pending non-profit developer' ? '#7EC069':
                d ==     'Sold non-profit developer' ? '#7EC069':
                d ==     'Pending for-profit/non-profit group' ? '#F6D472':
                d ==     'Sold for-profit/non-profit group' ? '#F6D472':
                d ==     'Pending for-profit developer' ? '#D82B2F':
                '#D82B2F';
        }

function getBorder(d)
    {
        return  d ==     'Pending non-profit developer' ? '#538D26':
                d ==     'Sold non-profit developer' ? '#538D26':
                d ==     'Pending for-profit/non-profit group' ? '#D4B047':
                d ==     'Sold for-profit/non-profit group' ? '#D4B047':
                d ==     'Pending for-profit developer' ? '#B01317':
                '#B01317';
        }

function getTextColor(d) {
        return  d ==     'Pending non-profit developer' ? '#69A748':
                d ==     'Sold non-profit developer' ? '#69A748':
                d ==     'Pending for-profit/non-profit group' ? '#D4B047':
                d ==     'Sold for-profit/non-profit group' ? '#D4B047':
                d ==     'Pending for-profit developer' ? '#d73027':
                '#d73027';
}


// INTERACTION

var soldData;
var pendingData;

function highlightFeature(e) {

    var layer = e.target;

    layer.setStyle({
        fillOpacity: 1,
        radius: 8
    });

    $(e.target.getElement()).attr('id', 'active');

    $('.leaflet-interactive').not('#active').css("fill","#BBB").css("fillOpacity","0.45").css("stroke","#999");

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

}

function resetHighlight(e) {

    var layer = e.target;

    layer.setStyle({
        fillOpacity: 0.6,
        radius: 7
    });

    $(e.target.getElement()).removeAttr("id");

    $('.leaflet-interactive').css("fill","").css("fillOpacity","").css("stroke","");
    
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
} 


function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng, 
        {
            radius: 7,
            color: getBorder(feature.properties.Symbol),
            fillColor: getColor(feature.properties.Symbol),
            weight: 1.5,
            opacity: 0.6,
            fillOpacity: 0.6
        }
    );
}

// FILTERING 

function soldFilter(feature) {
  if (feature.properties.Status === "Sold") return true
}

function pendingFilter(feature) {
    if (feature.properties.Status === "Pending") return true
} 

var soldData = L.geoJson(null, {
            pointToLayer: pointToLayer,
            onEachFeature: onEachFeature,
            filter: soldFilter 
});

var pendingData = L.geoJson(null, {
            pointToLayer: pointToLayer,
            onEachFeature: onEachFeature,
            filter: pendingFilter 
});

// MAP DATA

// Field Names: 
// Status   Symbol  Project_Name    Purchaser_Type  Purchaser_Name  Details_and_Restrictions    Restrictions_Source   Link_to_Proposed_Disposition  
// Source_of_Info  Date_Notice_was_Published   Date_of_Public_Hearing  Borough BoroCode    Block   Lot Address Link_to_Deed    Date_Deed_Signed    
// Lot_Code    Land_Use    Link_to_LivingLots  Link_to_Zola    Link_to_NYCommons   Address_Full    Latitude Longitude   
// Council_District    Community_District  Community_District_Code Community_District_Income   Percent_of_AMI                                                           

var ODL_sold = omnivore.csv('data.csv', null, soldData);
ODL_sold.addTo(map);

var ODL_pending = omnivore.csv('data.csv', null, pendingData);
ODL_pending.addTo(map);

// COMMUNITY DISTRICTS DATA

var reference = map.createPane('reference'); 

map.getPane('reference').style.zIndex = 250;

function commStyle(feature) {
    return {
        weight: 1,
        color: '#999',
        fillColor: 'rgba(0,0,0,0)',
        dashArray: 2,
        pane: reference 
    };
}

var community_districts = L.geoJson(commDistricts, {
    style: commStyle,
    interactive: false
});

// COUNCIL DISTRICTS DATA

function councilStyle(feature) {
    return {
        weight: 1,
        color: '#789ACB',
        fillColor: 'rgba(0,0,0,0)',
        dashArray: 2,
        pane: reference 
    };
}

var council_districts = L.geoJson(councilDistricts, {
    style: councilStyle,
    interactive: false
});


// POP UPS 

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

ODL_sold.bindPopup(function (layer) {
    return L.Util.template('<h3>Sold for $1</h3>' 
        + layer.feature.properties.Purchaser_Name + ', a ' + '<b style="color: ' + getTextColor(layer.feature.properties.Symbol) + ';">' + layer.feature.properties.Purchaser_Type + '</b>, bought this land from the city for one dollar on ' + layer.feature.properties.Date_Deed_Signed + '.<br>' +
            '<table>' + 
              '<tr><td>BBL</td><td>' + layer.feature.properties.Borough + ' block ' + layer.feature.properties.Block + ', lot ' + layer.feature.properties.Lot + '</td></tr>' + 
              '<tr><td>Address</td><td>' + layer.feature.properties.Address + '</td></tr>' +
              '<tr><td>Districts</td><td> <a target="_blank" href="https://communityprofiles.planning.nyc.gov/' + layer.feature.properties.Borough.toLowerCase() + '/' + layer.feature.properties.Community_District + '" style="color: ' + getTextColor(layer.feature.properties.Symbol) + ';">' +
                    layer.feature.properties.Borough + " Community District " + layer.feature.properties.Community_District + '</a>, <br><a style="color: ' + getTextColor(layer.feature.properties.Symbol) + ' ;" target="_blank" href="https://council.nyc.gov/district-' + layer.feature.properties.Council_District + '/">' +
                    'City Council District ' + layer.feature.properties.Council_District + '</a></td></tr>' +
              '<tr><td>Housing Restrictions</td><td>' + layer.feature.properties.Details_and_Restrictions + ' | <a style="color: ' + getTextColor(layer.feature.properties.Symbol) + ' ;" target="_blank" href="' + layer.feature.properties.Restrictions_Source +'">source</a></td></tr>' +
              '<tr><td>Community District Income</td><td>$' + numberWithCommas(layer.feature.properties.Community_District_Income) + ' median<br>(' + (layer.feature.properties.Community_District_Income/859).toFixed(0)+ '% AMI for household of three)</td></tr>' + 
              '</table><hr style="height:0px; visibility:hidden;" />' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="' + layer.feature.properties.Link_to_Proposed_Disposition + '">City Record notice</a>' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="' + layer.feature.properties.Link_to_Deed + '">Deed</a>' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="' + layer.feature.properties.Link_to_Zola + '">Detailed lot info (ZoLa)</a>');
        });

ODL_pending.bindPopup(function (layer) {
    return L.Util.template('<h3>Pending Sale for $1</h3>' 
        + layer.feature.properties.Purchaser_Name + ', a <b style="color: ' + getTextColor(layer.feature.properties.Symbol) + ';">' + layer.feature.properties.Purchaser_Type + '</b>, was a proposed one-dollar buyer of this land in a notice posted on ' + layer.feature.properties.Date_Notice_was_Published + '.<br>' +
            '<table>' + 
              '<tr><td>BBL</td><td>' + layer.feature.properties.Borough + ' block ' + layer.feature.properties.Block + ', lot ' + layer.feature.properties.Lot + '</td></tr>' + 
              '<tr><td>Address</td><td>' + layer.feature.properties.Address + '</td></tr>' +
              '<tr><td>Districts</td><td> <a target="_blank" href="https://communityprofiles.planning.nyc.gov/' + layer.feature.properties.Borough.toLowerCase() + '/' + layer.feature.properties.Community_District + '" style="color: ' + getTextColor(layer.feature.properties.Symbol) + ';">' +
                    layer.feature.properties.Borough + " Community District " + layer.feature.properties.Community_District + '</a>, <br><a style="color: ' + getTextColor(layer.feature.properties.Symbol) + ' ;" target="_blank" href="https://council.nyc.gov/district-' + layer.feature.properties.Council_District + '/">' +
                    'City Council District ' + layer.feature.properties.Council_District + '</a></td></tr>' +
              '<tr><td>Current Land Use</td><td>' + layer.feature.properties.Land_Use + '</td></tr>' +
              '<tr><td>Housing Restrictions</td><td>' + layer.feature.properties.Details_and_Restrictions + ' | <a style="color: ' + getTextColor(layer.feature.properties.Symbol) + ' ;" target="_blank" href="' + layer.feature.properties.Restrictions_Source +'">source</a></td></tr>' +
              '<tr><td>Community District Income</td><td>$' + numberWithCommas(layer.feature.properties.Community_District_Income) + ' median<br>(' + (layer.feature.properties.Community_District_Income/859).toFixed(0)+ '% AMI for household of three)</td></tr>' + 
              '</table><hr style="height:0px; visibility:hidden;" />' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="' + layer.feature.properties.Link_to_Proposed_Disposition + '">City Record notice</a>' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="mailto:organizers@596acres.org">Contact to organize</a>' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="' + layer.feature.properties.Link_to_Zola + '">Detailed lot info (ZoLa)</a>');
        });

map.on('popupopen', function(e) {
    var location = map.project(e.popup._latlng); 
    location.y -= e.popup._container.clientHeight/2;
    map.panTo(map.unproject(location),{animate: true}); 
    $(".legend").css("display","none");
    $(".leaflet-control-container").css("display","none");
    $("#title").css("display","none");
    $(".subtitle").css("display","none");
    $(".about-button").css("display","none");
});

map.on('popupclose', function(e) {
    $(".legend").css("display","block");
    $(".leaflet-control-container").css("display","block");
    $("#title").css("display","block");
    $(".subtitle").css("display","block");
    $(".about-button").css("display","block");
});

// LAYER CONTROL

var baselayers = {
};

var overlays = {
    "Sold $1 Lots": ODL_sold,
    "Pending $1 Lots": ODL_pending,
    "Community Districts": community_districts, 
    "Council Districts": council_districts
};

L.control.layers(baselayers, overlays, {position: 'topright', collapsed: false}).addTo(map);

L.control.zoom({position:'topright'}).addTo(map);

L.Control.geocoder().addTo(map);

$('.leaflet-control-layers-overlays span').click(function() {
    $(this).toggleClass('layer-selected')
 });

$('.leaflet-control-layers-base').html("<b>Data:</b> (as of ");
$('.leaflet-control-layers-base').append(dateUpdated,")");

$('.leaflet-control-layers-overlays span:contains(Districts)').toggleClass('layer-selected');

showAbout = false;

var toggleAbout = function(){
        if(showAbout === true){
           $('#about').hide(); 
           showAbout = false;
        }
        else{
           $('#about').show(); 
           showAbout = true;
        }
    }

map.on('layeradd', function(e) { document.getElementById('about').innerHTML = 
'<div><button class="about-close-button" onclick="toggleAbout();" style="outline: none;"><b>✕</b></button></div>' +
'<h3>ABOUT</h3>Since January, 2014, the city of New York has sold <b>' + ODL_sold.getLayers().length + 
'</b> city-owned lots of land to housing developers for $1.00 each. ' + 
    '<hr style="height:0px; visibility:hidden;" />' + 
'Some of this land has gone to organizations doing valuable and necessary work for the city—' + 
' developing homes for the extremely-low income, establishing shelters for LGBT youth.' +
'Some of this land has also gone to for-profit housing developers building market-rate apartments or affordable units too expensive for a local to live in. ' + 
    '<hr style="height:0px; visibility:hidden;" />' + 
'The <b>ONE DOLLAR LOTS</b> project by 596 Acres is an archive of these $1 lot sales as well as a tool for organizers to use to take action against' + 
' pending sales that may disrupt their communities. <b>' + ODL_pending.getLayers().length + ' </b>lots are still pending final sale.' + 
    '<hr style="height:0px; visibility:hidden;" />'; }); //+ 
//'This site is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License</a>.';


 