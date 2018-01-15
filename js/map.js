// BASEMAP

// var map = L.map('mainmap').setView([40.716303, -73.940535], 11);

var map = L.map('mainmap', {
    center: [40.716303, -73.940535], 
    zoom: 11,
    zoomControl: false
});

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        maxZoom: 18,
        opacity: 0.8,
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

// SYMBOLOGY

function getColor(d) 
    {
        return  d ==     'Pending HDFC Coop' ? '#3288bd':
                d ==     'Sold HDFC Coop' ? '#3288bd':
                d ==     'Pending Non-Profit Developer' ? '#91cf60':
                d ==     'Sold Non-Profit Developer' ? '#91cf60':
                d ==     'Pending For-Profit Developer/Non-Profit Developer' ? '#FFDD7C':
                d ==     'Sold For-Profit Developer/Non-Profit Developer' ? '#FFDD7C':
                d ==     'Pending For-Profit Developer' ? '#d73027':
                '#d73027';
        }

function getBorder(d)
    {
        return  d ==     'Pending HDFC Coop' ? '#0A5A89':
                d ==     'Sold HDFC Coop' ? '#0A5A89':
                d ==     'Pending Non-Profit Developer' ? '#538D26':
                d ==     'Sold Non-Profit Developer' ? '#538D26':
                d ==     'Pending For-Profit Developer/Non-Profit Developer' ? '#BA9838':
                d ==     'Sold For-Profit Developer/Non-Profit Developer' ? '#BA9838':
                d ==     'Pending For-Profit Developer' ? '#830B05':
                '#830B05';
        }

function getTextColor(d) {
        return  d ==     'Pending HDFC Coop' ? '#3288bd':
                d ==     'Sold HDFC Coop' ? '#3288bd':
                d ==     'Pending Non-Profit Developer' ? '#72AE43':
                d ==     'Sold Non-Profit Developer' ? '#72AE43':
                d ==     'Pending For-Profit Developer/Non-Profit Developer' ? '#DDBB5A':
                d ==     'Sold For-Profit Developer/Non-Profit Developer' ? '#DDBB5A':
                d ==     'Pending For-Profit Developer' ? '#d73027':
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


/* TWO SEPARATE SYMBOLOGIES

function pointToLayerSold(feature, latlng) {
    return L.circleMarker(latlng, 
        {
            radius: 7,
            fillColor: getColor(feature.properties.Symbol),
            weight: 0,
            fillOpacity: 0.6
        }
    );
}

function pointToLayerPending(feature, latlng) {
    return L.circleMarker(latlng, 
        {
            radius: 7,
            color: getBorder(feature.properties.Symbol),
            fillColor: getColor(feature.properties.Symbol),
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.6
        }
    );
}

*/

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

// HOVER TEXT 

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}


// MAP DATA

// Field Names: 
// Status   Symbol  Project_Name    Purchaser_Type  Purchaser_Name  Details_and_Restrictions    Link_to_Proposed_Disposition    Source_of_Info  
// Date_Notice_was_Published   Date_of_Public_Hearing  Borough BoroCode    Block   Lot Address Link_to_Deed    Date_Deed_Signed    Lot_Code    
// Link_to_LivingLots  Address_Full    Lat    Long                              

var ODL_sold = omnivore.csv('data.csv', null, soldData);
ODL_sold.addTo(map);

var ODL_pending = omnivore.csv('data.csv', null, pendingData);
ODL_pending.addTo(map);


// POP UPS 

ODL_sold.bindPopup(function (layer) {
    return L.Util.template('<h3>Sold for $1</h3>' 
        + layer.feature.properties.Purchaser_Name + ', a ' + '<b style="color: ' + getTextColor(layer.feature.properties.Symbol) + ';">' + layer.feature.properties.Purchaser_Type + '</b>, bought this land from the city for one dollar on ' + layer.feature.properties.Date_Deed_Signed + '.<br>' +
            '<br><table>' + 
              '<tr><td>Borough</td><td>' + layer.feature.properties.Borough + '</td></tr>' + 
              '<tr><td>Block</td><td>' + layer.feature.properties.Block + '</td></tr>' +
              '<tr><td>Lot</td><td>' + layer.feature.properties.Lot + '</td></tr>' +
              '<tr><td>Address</td><td>' + layer.feature.properties.Address + '</td></tr>' +
              '</table><br>' +
              '<a class="btn-grey" target="_blank" href="' + layer.feature.properties.Link_to_Proposed_Disposition + '">Link to City Notice >> </a> &emsp;' +
              '<a class="btn-grey" target="_blank" href="' + layer.feature.properties.Link_to_Deed + '">Link to Deed >> </a>');
        });



ODL_pending.bindPopup(function (layer) {
    return L.Util.template('<h3>Pending Sale for $1</h3>' 
        + layer.feature.properties.Purchaser_Name + ', a <b style="color: ' + getTextColor(layer.feature.properties.Symbol) + ';">' + layer.feature.properties.Purchaser_Type + '</b>, was a proposed one-dollar buyer of this land in a notice posted on ' + layer.feature.properties.Date_Notice_was_Published + '.<br>' +
            '<br><table>' + 
              '<tr><td>Borough</td><td>' + layer.feature.properties.Borough + '</td></tr>' + 
              '<tr><td>Block</td><td>' + layer.feature.properties.Block + '</td></tr>' +
              '<tr><td>Lot</td><td>' + layer.feature.properties.Lot + '</td></tr>' +
              '<tr><td>Address</td><td>' + layer.feature.properties.Address + '</td></tr>' +
              '<tr><td>Date of Public Hearing</td><td>' + layer.feature.properties.Date_of_Public_Hearing + '</td></tr>' +
              '</table><br>' + 
              '<a class="btn-grey" target="_blank" href="' + layer.feature.properties.Link_to_Proposed_Disposition + '">Link to City Notice >> </a>'
              );
        });

map.on('popupopen', function(e) {
    var location = map.project(e.popup._latlng); 
    location.y -= e.popup._container.clientHeight/2;
    map.panTo(map.unproject(location),{animate: true}); 
});

// LAYER CONTROL

var baselayers = {};

var overlays = {
    "Sold $1 Lots": ODL_sold,
    "Pending $1 Lots": ODL_pending
};

L.control.layers(baselayers, overlays, {collapsed: false}).addTo(map);

L.control.zoom({position:'topright'}).addTo(map);

L.Control.geocoder().addTo(map);




//LEGEND

/* 

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

var div = L.DomUtil.create('div', 'info legend'),
    grades = [-45000, -30000, -15000, -5000, 5000, 15000, 30000, 45000, 60000],
    labels = ["Text", "", "", "", "Text", "", "", "", "Text"];

        div.innerHTML = div.innerHTML + '<b>One Dollar Lots Legend<b><br><br>'
    for (var i = grades.length - 1; i > -1; i--) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] - 1) + '"></i> ' +
                labels[i] + '<br>';
    }

    return div;
};

legend.addTo(map);

*/ 

//LEGEND AND LAYER TOGGLE 

showLegend = false; 

var toggleLegend = function(){
        if(showLegend === true){
           $('.legend').hide();
           $('.legend-close-button').removeClass('legend-close-button').addClass('legend-toggle-button').html("<b>i</b>");
           showLegend = false;  
        }
        else{
           $('.legend').show(); 
           $('.legend-toggle-button').removeClass('legend-toggle-button').addClass('legend-close-button').html("<b> &#10005;</b>");
           showLegend = true;
        }
    }

$('.leaflet-control-layers-overlays span').click(function() {
    $(this).toggleClass('layer-selected')
 });

 