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

// SYMBOLOGY FUNCTIONS 

function getColor(d) 
    {
        return  d ==     'Sold non-profit developer' ? '#7EC069':
                d ==     'Sold for-profit/non-profit group' ? '#F6D472':
                d ==     'Sold for-profit developer' ? '#D82B2F':
                '#956FD6';
        }

function getBorder(d)
    {
        return  d ==     'Sold non-profit developer' ? '#538D26':
                d ==     'Sold for-profit/non-profit group' ? '#D4B047':
                d ==     'Sold for-profit developer' ? '#B01317':
                '#7A5BB0';
        }

function getTextColor(d) {
        return  d ==     'Sold non-profit developer' ? '#69A748':
                d ==     'Sold for-profit/non-profit group' ? '#D4B047':
                d ==     'Sold for-profit developer' ? '#d73027':
                '#8865C3';
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
// Status   Symbol  Project_Name    Purchaser_Type  Purchaser_Name  Details_and_Restrictions    Length_of_Restrictions  
// Link_to_Restrictions_Source Restrictions_Source Link_to_Proposed_Disposition    Source_of_Proposal  Date_Notice_was_Published   
// Date_of_Public_Hearing  Borough BoroCode    Block   Lot Address Link_to_Deed    Date_Deed_Signed    Lot_Code    Land_Use   
// Link_to_LivingLots  Link_to_Zola    Link_to_NYCommons   Address_Full    Latitude    Longitude   Council_District    Community_District  
// Community_District_Code Community_District_Income   Percent_of_AMI              

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

function edcText(x) {
    if (x == "EDC Board Meeting Minutes") {
        return "Notes from an EDC board meeting on "
    }
    else {
        return "A City Record notice posted on "
    }
}

function edcButton(x) {
    if (x == "EDC Board Meeting Minutes") {
        return "EDC meeting notes"
    }
    else {
        return "City Record notice"
    }
}

function shortenLandDisp(x) {
    if (x == "Land Disposition Agreement") {
        return "Land Dispo. Agreement"
    }
    else { 
        return x 
    }
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
              '<tr><td>Housing Restrictions</td><td>' + layer.feature.properties.Details_and_Restrictions + '<br>&nbsp; — <a style="color:' + getTextColor(layer.feature.properties.Symbol) + ' ;" target="_blank" href="' + layer.feature.properties.Link_to_Restrictions_Source +'">' + layer.feature.properties.Restrictions_Source + '</a></td></tr>' + 
              '<tr><td>Restriction Period</td><td>' + layer.feature.properties.Length_of_Restrictions + '</td></tr>' + 
              '<tr><td>Community District Income</td><td>$' + numberWithCommas(layer.feature.properties.Community_District_Income) + ' median<br>(' + (layer.feature.properties.Community_District_Income/859).toFixed(0)+ '% AMI for household of three)</td></tr>' + 
              '</table><hr style="height:0px; visibility:hidden;" />' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="' + layer.feature.properties.Link_to_Proposed_Disposition + '">' + edcButton(layer.feature.properties.Source_of_Info) + '</a>' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="' + layer.feature.properties.Link_to_Restrictions_Source + '">' + shortenLandDisp(layer.feature.properties.Restrictions_Source) + '</a>' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="' + layer.feature.properties.Link_to_Deed + '">Deed</a>' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="' + layer.feature.properties.Link_to_Zola + '">Detailed lot info (ZoLa)</a>');
        });

ODL_pending.bindPopup(function (layer) {
    return L.Util.template('<h3>Pending Sale for $1</h3>' 
        + edcText(layer.feature.properties.Source_of_Proposal) + layer.feature.properties.Date_Notice_was_Published + ' identified this lot as a <b style="color:#8865C3">potential $1 sale</b> and proposed ' +
        layer.feature.properties.Purchaser_Name + ', a ' + layer.feature.properties.Purchaser_Type + ', as a buyer.' + 
            '<table>' + 
              '<tr><td>BBL</td><td>' + layer.feature.properties.Borough + ' block ' + layer.feature.properties.Block + ', lot ' + layer.feature.properties.Lot + '</td></tr>' + 
              '<tr><td>Address</td><td>' + layer.feature.properties.Address + '</td></tr>' +
              '<tr><td>Districts</td><td> <a target="_blank" href="https://communityprofiles.planning.nyc.gov/' + layer.feature.properties.Borough.toLowerCase() + '/' + layer.feature.properties.Community_District + '" style="color: ' + getTextColor(layer.feature.properties.Symbol) + ';">' +
                    layer.feature.properties.Borough + " Community District " + layer.feature.properties.Community_District + '</a>, <br><a style="color: ' + getTextColor(layer.feature.properties.Symbol) + ' ;" target="_blank" href="https://council.nyc.gov/district-' + layer.feature.properties.Council_District + '/">' +
                    'City Council District ' + layer.feature.properties.Council_District + '</a></td></tr>' +
              '<tr><td>Current Use</td><td>' + layer.feature.properties.Land_Use + '</td></tr>' +
              '<tr><td>Proposed Restrictions</td><td>' + layer.feature.properties.Details_and_Restrictions + '<br>&nbsp; — <a style="color:' + getTextColor(layer.feature.properties.Symbol) + ' ;" target="_blank" href="' + layer.feature.properties.Link_to_Restrictions_Source +'">' + layer.feature.properties.Restrictions_Source + '</a></td></tr>' + 
              '<tr><td>Community District Income</td><td>$' + numberWithCommas(layer.feature.properties.Community_District_Income) + ' median<br>(' + (layer.feature.properties.Community_District_Income/859).toFixed(0)+ '% AMI for household of three)</td></tr>' + 
              '</table><hr style="height:0px; visibility:hidden;" />' +
              '<a class="btn-grey" style="background-color:' + getTextColor(layer.feature.properties.Symbol) + ';" target="_blank" href="' + layer.feature.properties.Link_to_Proposed_Disposition + '">' + edcButton(layer.feature.properties.Source_of_Proposal) + '</a>' +
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

$('.leaflet-control-layers-overlays span').click(function() {
    $(this).toggleClass('layer-selected')
});

$('.leaflet-control-layers-base').html("<b>Data:</b> (as of ");
$('.leaflet-control-layers-base').append(dateUpdated,")");

$('.leaflet-control-layers-overlays span:contains(Districts)').toggleClass('layer-selected');

// OTHER CONTROLS

L.control.zoom({position:'topright'}).addTo(map);

var searchControl = L.esri.Geocoding.geosearch({position:'topright'}).addTo(map);

var results = L.layerGroup().addTo(map);

searchControl.on("results", function(data) {
    results.clearLayers();
    for (var i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.marker(data.results[i].latlng));
    }
});

// ABOUT PAGE

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
    '<div class="about-banner">' +
    '<button class="about-close-button" onclick="toggleAbout();" style="outline: none;"><b>✕</b></button>' +
    '<div id="logo-596"><a href="http://596acres.org/" target="_blank"><img src="images/596.png" width="40px"></a></div></div>' +
'<h3>ABOUT</h3>' + 
    'Since Mayor Bill de Blasio took office on January 1st, 2014, the City of New York has sold <b>' + ODL_sold.getLayers().length + 
    '</b> city-owned lots of land to housing developers for $1.00 each. ' + 
        '<hr style="height:0px; visibility:hidden;" />' + 
    'Some of this land has gone to organizations doing valuable and necessary work for the city—' + 
    ' developing permanent homes for the extremely-low income, establishing ' + 
    '<a href="https://www.dnainfo.com/new-york/20160823/east-village/bea-arthur-lgbt-homeless-shelter-slated-for-completion-feb-2017" target="_blank">shelters for LGBT youth</a>. ' +
    'Some of this land has also gone to for-profit housing developers building ' + 
    '<a href="http://www.nydailynews.com/new-york/hpd-plans-sell-prime-land-1-private-developer-article-1.2092855" target="_blank">market-rate apartments</a> ' + 
    'or "affordable" units too expensive for locals to live in. ' +
    'And these sales are happening with <a href="https://citylimits.org/2016/06/14/cityviews-city-giving-away-land-with-little-public-discussion/" target="_blank">few opportunities</a> for input from those most impacted. ' +
    'To date, only <b>one</b> of these lots has become permanently affordable housing.' +
        '<hr style="height:0px; visibility:hidden;" />' + 
    'The ONE DOLLAR LOTS project by <a href="http://596acres.org/" target="_blank">596 Acres</a> is an archive of these $1 lot sales. It is also a place for organizers and local residents to get information about ' + 
    'pending sales that may disrupt their communities and imagine better uses for cheap public land. <b>' + ODL_pending.getLayers().length + ' </b> lots are still pending final sale.' + 
'<h3>METHODOLOGY</h3>' +
    'Any time the City plans to sell public land for $1, it posts a "Disposition Notice" in the ' +
    'online <a href="https://a856-cityrecord.nyc.gov/Search/AdvancedCity" target="_blank">City Records database</a>. We tracked ' + 
    'all of these notices posted since January 2014 and we added them to our "pending" list of $1 sales. Sometimes, we also found potential $1 sales in ' + 
    '<a href="https://www.nycedc.com/about-nycedc/financial-public-documents" target="_blank">EDC board meeting mintues</a>.' +
        '<hr style="height:0px; visibility:hidden;" />' + 
    'For each pending sale, we used the <a href="https://a836-acris.nyc.gov/DS/DocumentSearch/BBL" target="_blank">ACRIS database</a> to check if the sale had taken place. ' + 
    'A deed tells us when the land was sold and who it was sold to. Each time we found a deed, we transferred the $1 lot from our "pending" list to our "sold" list.' + 
        '<hr style="height:0px; visibility:hidden;" />' + 
    'Also on <a href="https://a836-acris.nyc.gov/DS/DocumentSearch/BBL" target="_blank">ACRIS</a>, ' +
    'each deed is posted along with a regulatory agreement that spells out certain restrictions on how the developer must use the land. This is crucial information: these agreements include ' +
    'what target incomes any new housing must be built for and how long these affordability restrictions last— good indicators of how useful new housing may be for the local community.' + 
        '<hr style="height:0px; visibility:hidden;" />' + 
    'Take a look at the raw data <a href="https://docs.google.com/spreadsheets/d/1D7TIpWiOHXa_--9rlAB7zI146C8tMl6756w1FBu6Pfw/edit?usp=sharing" target="_blank">here</a>.' +
'<h3>USING THE MAP</h3>' + 
    'In the upper-right, click on the map controls to toggle different layers on and off, zoom in and out, and locate an address.' + 
        '<hr style="height:0px; visibility:hidden;" />' + 
    'Click on a point on the map to view all details regarding a $1 sale. To see general demographic information about the area the lot is in, click on the "Community District" link. ' + 
    'To contact the local Council Member, click on the "City Council District" link.' +
        '<hr style="height:0px; visibility:hidden;" />' + 
    'When clicking on a point, make sure to look at the "Housing Restrictions" section and compare it to "Community District Income." This gives an idea of how useful this land sale may be to locals.' + 
    ' Keep in mind: <b> a non-profit developer is not necessarily serving the commmunity well</b>. If you need more detailed information on housing restrictions, click on the source link below the restrictions to see the proposal or agreement regarding the sale.' +
'<h3>WHY IT MATTERS</h3>' +
    'Public land is a priceless resource. Historically, it has been used by residents of NYC to create the places we know we need to survive and thrive. ' + 
    'Kept public or given away cheaply to groups organized specifically to ensure long-term public benefit— like community land trusts— ' +
    'public land has become deeply and permanently affordable housing, community, cooperative, cultural and commercial spaces, and so much more. ' + 
    'Public land is a great starting place for actualizing the city as commons!' +  
        '<hr style="height:0px; visibility:hidden;" />' + 
    'These vacant city-owned lots that have been sold for $1 are vacant due to decades of institutionally racist land use policies including ' +
    '<a href="https://native-land.ca" target="_blank">settler colonialism</a>, ' +
    '<a href="https://dsl.richmond.edu/panorama/redlining/#loc=5/39.105/-94.583&amp;opacity=0.8" target="_blank">redlining</a>, ' +
    'and <a href="http://urbanreviewer.org" target="_blank">Urban Renewal Area clearance</a>. ' +
    'Many of these lots languish in the middle of active blocks primarily in low-income neighborhoods of color, and they exist for years fenced off by the government but otherwise not maintained. '+ 
    'Fast forward to 2014, and the city is selling them without input from the people who have long dealt with the real life impact of abandoned land in their lives. ' +
    'This squanders potential opportunities for transforming historical violence and for creating lasting, adaptive public benefit.' +
'<h3>HELPFUL LINKS</h3>' +
    '• <a href="https://livinglotsnyc.org/" target="_blank">LivingLots</a>, ' + 
    'a web tool that supports local organizing campaigns to turn vacant lots into community-stewarded land. Created by <a href="http://596acres.org/" target="_blank">596 Acres</a>.' +
        '<hr style="height:0px; visibility:hidden;" />' + 
    '• <a href="https://nycommons.org/" target="_blank">NYCommons</a>, ' + 
    'a map of different places the public owns with information for local community land access organizing, including any pending sales. ' +
    'Created through collaboration between <a href="http://www.commoncause.org/states/new-york/" target="_blank">Common Cause/NY</a>, the <a href="http://cdp.urbanjustice.org/" target="_blank">Community Development Project at the Urban Justice Center</a>, and <a href="/admin/page/page/3/change/596acres.org" target="_blank">596 Acres</a>.' + 
        '<hr style="height:0px; visibility:hidden;" />' + 
    '• <a href="http://lghttp.58547.nexcesscdn.net/803F44A/images/nycss/images/uploads/pubs/housing_new_york_-_FINAL_9_20_17.pdf" target="_blank">"Taking Stock" report</a>, ' +
    'a data-driven independent review of common concerns surrounding the City&#8217;s Housing New York plan, by <a href="http://www.cssny.org/" target="_blank">Community Service Society</a>.' +
'<h3>CONTACT US</h3>' +
    'To ask questions, suggest changes, or get help organizing to change how dollar sales are impacting your neighborhood and city, contact <a href="http://596acres.org/" target="_blank">596 Acres</a>:' +
        '<hr style="height:0px; visibility:hidden;" />' + 
    '<b>Email:</b> <a href="mailto:organizers@596acres.org" target="_blank">organizers@596acres.org</a><br>' +
    '<b>Phone:</b> (718) 316-6092<br>' + 
    '<b>Website:</b> <a href="http://596acres.org/" target="_blank">596acres.org</a>' +
'<h3>CREDITS</h3>' +
    'This map was created by <a href="http://596acres.org/" target="_blank">596 Acres</a> with help from some of our friends and partners.' +
        '<hr style="height:0px; visibility:hidden;" />' +
    '<b>Methodology:</b><br>' + 
    '<span class="ita">• Tiera Mack</span>, Masters in Urban Planning student<br>' +
    '<span class="ita">• Paula Z. Segal</span>, Esq., <a href="https://cdp.urbanjustice.org/cdp-equitable-neighborhoods" target="_blank">Equitable Neighborhoods Practice</a>, CDP @eqneighborhoods<br> ' +
    '<span class="ita">• Cea Weaver</span>, Research & Policy Director, <a href="http://nycommunities.org" target="_blank">New York Communities for Change</a><br>' +
        '<hr style="height:0px; visibility:hidden;" />' +
    '<b>Data gathering:</b><br>' +
    '<span class="ita">• Tiera Mack</span><br>' +
    '<span class="ita">• Sam Raby</span>, Web Tools Developer Intern, <a href="http://596acres.org/" target="_blank">596 Acres</a><br>' +
    '<span class="ita">• Paula Z. Segal</span><br>'+ 
    '<span class="ita">• Cea Weaver</span><br>' + 
        '<hr style="height:0px; visibility:hidden;" />' +
    '<b>Web tool development:</b><br>' +
    '<span class="ita">• Sam Raby</span><br>' +
        '<hr style="height:0px; visibility:hidden;" />' +
    '<b>Special thanks:</b><br>' +
    '<span class="ita">• Stephanie Alvarado</span> and <span class="ita">Mara Kravitz</span>, Directors of Advocacy and Partnerships, <a href="http://596acres.org/" target="_blank">596 Acres</a><br>' +
    '<span class="ita">• Oksana Mironova</span>, <a href="http://www.cssny.org/" target="_blank">CSS</a><br> ' + 
    '<span class="ita">• Stephanie Sosa</span> and <span class="ita">Christopher Walters</span>, <a href="https://anhd.org/" target="_blank">ANHD</a>' +
'<h3>LICENSE</h3>' +
    'This site is licensed through Creative Commons under the ' + 
    '<a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">CC BY-NC-ND 4.0</a> license.' +
''; }); 


 