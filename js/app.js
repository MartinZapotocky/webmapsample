require([
    "esri/urlUtils",
  "dojo/parser",
  "dojo/_base/lang",
  "dijit/registry",
  "esri/map",
 "dojo/_base/connect",
  "searching/SearchWidget",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
  "dojo/domReady!"
], function(
    urlUtils, parser, lang, registry, Map, connect, SearchWidget, ArcGISDynamicMapServiceLayer
) {

    urlUtils.addProxyRule({
        proxyUrl: "http://mapy.tuzvo.sk/agsproxy/proxy.ashx",
        urlPrefix: "http://mapy.tuzvo.sk/webags/rest/services/"
    });

  parser.parse();

  var map = new Map("mapDiv", {
  
  });

  var podklad = new ArcGISDynamicMapServiceLayer(
      "http://nipi.sazp.sk/ArcGIS/rest/services/podklady/podklad_svm50/MapServer", {
          id: "podklad"
      }
  );

  podklad.show();
  map.addLayer(podklad);

  var search = new SearchWidget({
      map: map,
      mapServiceTown: "http://mapy.tuzvo.sk/webags/rest/services/VSLP/admin_hranice/MapServer/2",
      mapServiceDistrict: "http://mapy.tuzvo.sk/webags/rest/services/VSLP/admin_hranice/MapServer/1",
      mapServiceRegion: "http://mapy.tuzvo.sk/webags/rest/services/VSLP/admin_hranice/MapServer/0"
  }, "search-widget");

  var searchBtn = registry.byId("search-btn");

  searchBtn.on("click", lang.hitch(search, search.show));

    dojo.connect(map, "onUpdateStart", function () {
        esri.show(dojo.byId("loadingPartial"));
    });
    dojo.connect(map, "onUpdateEnd", function () {
        esri.hide(dojo.byId("loading"));
        esri.hide(dojo.byId("loadingPartial"));
    });

});
