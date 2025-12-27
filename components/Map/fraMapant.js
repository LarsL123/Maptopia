
    
    var snap_sensitivity=200;
    var snap_sizes=[ [2100,2970], [2970,2100],[2100*.75,2970*.75], [2970*.75,2100*.75],[2100*.5,2970*.5], [2970*.5,2100*.5] ];
    var snap_names=['A4 portrait 1:10.000','A4 landscape 1:10.000','A4 portrait 1:7.500','A4 landscape 1:7.500','A4 portrait 1:5.000','A4 landscape 1:5.000'];
    var currentexport=null;
    var markers_reported = L.layerGroup();
    
  function createMap(){
      var res = [
	  8000 / 8,
		8000 / 16,
		8000 / 32,
		8000 / 64,
		8000 / 128,
		8000 / 256,
		8000 / 512,
		8000 / 1024,
		8000 / 2048,
		8000 / 4096,	
	  8000 / 8192,
		8000 / 16384
      ]; console.log(res);
    var crs = new L.Proj.CRS(
	"EPSG:32633",
	"+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs",
	{
	    resolutions: res,
	    origin: [-150000, 10000000],
	    bounds: L.bounds([-100000, 8000000], [1280252, 6400000])
	});



    var map = new L.Map("mapid", {
	crs: crs,
	continuousWorld: true,
	maxZoom: 11
    });

    var templateUrl;
    templateUrl = "https://mapant.no/tiles/{z}/{y}/{x}.png";

    var mapantLayer = new L.TileLayer(templateUrl, {
	maxZoom: 11,
	maxNativeZoom: 10,
	minZoom: 0,
	tileSize: 1024,
	continuousWorld: true, 
	unloadInvisibleTiles: false,
	attribution: 'Basert p&aring; FKB og laserdata &copy; Statens Kartverk, Geovekst og kommunene.<br/>Med st&oslash;tte fra Sparebankstiftelsen DNB.'
    }).addTo(map);

    new L.control.scale({
	position: 'bottomright',
	imperial: false
    }).addTo(map);


      L.control.measure({
	  position: 'topleft'
      }).addTo(map)

      
      var popup = L.popup();


      var stedsnavnWmsLayer = L.tileLayer.wms('https://mapant.no/internal-wms',
					      {transparent: true, srs:"EPSG:32633",
					       layers:"mapant:unified-names", format:"image/png8",
					       attribution:"Stedsnavn © OpenStreetMap contributors"
					      });

      var osmPathsWms = L.tileLayer.wms('https://mapant.no/internal-wms',
					      {transparent: true, srs:"EPSG:32633",
					       layers:"mapant:osm_paths", format:"image/png8",
					       attribution:"Stier © OpenStreetMap contributors"
					      });




      var u33nGrid = L.utmGrid(33, false, {
	  color: '#008',
	  minInterval: 1000,
	  maxInterval: 1000,
	  bounds: [[-100000, 0] , [1200000, 9400000]],
	  minZoom: 3,
	  showAxisLabels: [],
	  showSquareLabels: [], // label 1km grid squares
      });


      var osmPathsCached = new L.TileLayer("https://mapant.no/tiles/osmpath/{z}/{x}/{y}.png",
					   {transparent: true, srs:"EPSG:32633", tileSize: 1024, maxNativeZoom: 10,minZoom:6,
					    attribution:"Stier © OpenStreetMap contributors"
					   });

      var stedsnavnCached = new L.TileLayer("https://mapant.no/tiles/names/{z}/{x}/{y}.png",
					    {transparent: true, srs:"EPSG:32633", tileSize: 1024, maxNativeZoom: 10,
					     attribution:"Stedsnavn © OpenStreetMap contributors"
					    });

      var baseMaps = {
	  "mapant": mapantLayer
      }
      var overlayMaps = {
	  "Names": stedsnavnCached,
	  "OSM Paths": osmPathsCached,
	  "UTM 33 grid": u33nGrid,
	  "Reported tiles": markers_reported,

      };

      L.control.layers(baseMaps,overlayMaps).addTo(map);

      map.on('overlayadd', function(e) {
	  if (e.name === 'Reported tiles') {
	      load_reported();
	  }
      });

      function onMapClick(e) {
	  console.log(e);
	  var utm = map.options.crs.project(e.latlng);
	  var x = Math.floor(utm.x/1000)*1000;
	  var y = Math.floor(utm.y/1000)*1000;
	  var tile = x + "_" + y;

	  var sw = map.options.crs.project(map.getBounds().getSouthWest());
	  var ne = map.options.crs.project(map.getBounds().getNorthEast());
	  var boundspar = "x0="+Math.round(sw.x)+"&amp;"+
	      "y0="+Math.round(sw.y)+"&amp;"+
	      "x1="+Math.round(ne.x)+"&amp;"+
	      "y1="+Math.round(ne.y)+"&amp;";
	  console.log(utm);
	  const url = "https://mapant.no/?lat="+e.latlng.lat+"&lng="+e.latlng.lng+"&zl="+map.getZoom();

	  var viewportdl = "<br/><br/><li><a download title=\"Download viewport (takes up to 20 seconds)\" href=\"https://mapant.no/api/extract-png?"+boundspar+"\">Download png</a> "+
	      " and <a download href=\"https://mapant.no/api/extract-pgw?"+boundspar+"\">pgw</a> of viewport</a>";
	  if (map.getZoom()<9) { viewportdl=""; }
	  
	  popup
	      .setLatLng(e.latlng)
	  
	      .setContent("Location " + e.latlng +"<br/>UTM33 (x,y): " + Math.round(utm.x)+" "+Math.round(utm.y)+
			  "<p><ul>"+
			  "<li><a href=\""+url+"\">Link here</a>"+
			  "<li><a href=\"https://kart.finn.no/?lat="+e.latlng.lat+"&lng="+e.latlng.lng+"&zoom="+(6+map.getZoom())+"\">Link to kart.finn.no</a>"+
			  "<li><a href=\"https://www.norgeibilder.no/?x="+Math.floor(utm.x)+"&y="+Math.floor(utm.y)+"&level="+(6+map.getZoom())+"&utm=33\">Link to <i>Norge i bilder</i></a>"+
			  "<li><a href=\"https://hoydedata.no/LaserInnsyn2/?xmin="+Math.floor(sw.x)+"&ymin="+Math.floor(sw.y)+"&xmax="+Math.floor(ne.x)+"&ymax="+Math.floor(ne.y)+"&wkid=25833\">Link to <i>Høydedata</i></a>"+
			  "<li><a href=\"https://google.no/maps/@"+e.latlng.lat+","+e.latlng.lng+","+(6+map.getZoom())+"z\">Link to Google maps</a>"+
			  viewportdl +
			  "<br/><br/>"+
			  "<li><a download href=\"/rendered/full_"+Math.floor(utm.x/1000)*1000+"_"+ Math.floor(utm.y/1000)*1000+".png\">Download this tile in full resolution</a><br/>"+
			  "<li><a download href=\"/rendered/full_"+Math.floor(utm.x/1000)*1000+"_"+ Math.floor(utm.y/1000)*1000+".pgw\">Download this tile's pgw</a><br/><br/>"+

			   "<li><a href=\"#\" onclick=\"return postCmd(this,'/api/report?x="+x+"&amp;y="+y+"')\">There is something wrong with this tile</a>"+
			   "<li><a href=\"#\" onclick=\"return postCmd(this,'/api/report-fixed?x="+x+"&amp;y="+y+"')\">Nothing wrong with this tile</a>"+
			  
			  "<li><a target=\"_blank\" href=\""+
			  "https://docs.google.com/forms/d/e/1FAIpQLSeGFhTRvldxtNkQAtNQCDmdNz9EuEFehCVG--kcdRpAqa0coQ/viewform?usp=pp_url&entry.276133580="+encodeURIComponent(url)+"\">General feedback</a>" +

			  "<div id=\"spinner-id\" ><img src=\"spinner.gif\" width=\"50\" height=\"50\"></div>"+
			  
			  "</p>"
			 )
	      .openOn(map);
      }

      map.on('contextmenu', onMapClick);
      map.on('moveend', function(e) {
	  document.getElementById("zoom-level").textContent="Zoom "+map.getZoom();
	  document.getElementById("where").innerHTML="<a href=\"/?lat="+map.getCenter().lat+"&amp;lng="+map.getCenter().lng+
	      "&amp;zl="+map.getZoom()
	      +"\">"
	      +map.getCenter().lat.toFixed(5)+","+map.getCenter().lng.toFixed(5)+"</a>";
      });

    return map;
  }

        function postCmd(e,url) {
	  document.getElementById("spinner-id").style.display="block";
	  console.log(e.parent);
	  console.log(url);
	  fetch(url).then(function() {       document.getElementById("spinner-id").style.display="none";});
	  return false;
      }




