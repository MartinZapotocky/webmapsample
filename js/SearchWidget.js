define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",
    "dijit/registry",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_OnDijitClickMixin",
    "dojo/text!./templates/SearchTool.html",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
    "esri/graphic",
    "dojo/store/Memory", "dijit/form/ComboBox", "dojo/domReady!"
], function (
    declare, arrayUtils, lang, dom, domStyle, on, registry, _WidgetBase, _TemplatedMixin, _OnDijitClickMixin,
    dijitTemplate, Query, QueryTask, SimpleFillSymbol, SimpleLineSymbol, Color, Graphic, Memory, ComboBox
) {
        return declare([_WidgetBase, _TemplatedMixin, _OnDijitClickMixin], {
            baseClass: "search-tool",
            templateString: dijitTemplate,
            constructor: function (options, srcRefNode) {
                if (typeof srcRefNode === "string") {
                    srcRefNode = dom.byId(srcRefNode);
                }
                this.queryTaskTown = new QueryTask(options.mapServiceTown);
                this.queryTaskDistrict = new QueryTask(options.mapServiceDistrict);
                this.queryTaskRegion = new QueryTask(options.mapServiceRegion);
                this.map = options.map;
                this.domNode = srcRefNode;
            },
            /*Zobrazenie nástroja vyh¾adávania s vytvorením combobox-ov a ich náplò údajmi*/
            show: function () {
                domStyle.set(this.domNode, "display", "block");
                var queryTown = Query();
                queryTown.where = "NM4 is not null";
                queryTown.returnGeometry = false;
                queryTown.outFields = ["NM4, IDN3, IDN2"];

                this.queryTaskTown.execute(queryTown, showDropdownTown);

                var stateStoreTown = new Memory({
                    data: []
                });

                var wholeArrayTowns = [];

                function showDropdownTown(results) {
                    for (var i = 0; i < results.features.length; i++) {
                        stateStoreTown.data.push({ name: results.features[i].attributes.NM4, id_district: results.features[i].attributes.IDN3, id_region: results.features[i].attributes.IDN2 });
                    }
                    wholeArrayTowns = stateStoreTown.data;
                }

                var comboBoxTown = new ComboBox({
                    id: "townValue",
                    name: "town",
                    store: stateStoreTown,
                    searchAttr: "name"
                }, "townValue")

                comboBoxTown.startup();
                var queryDistrict = Query();
                queryDistrict.where = "NM3 is not null";
                queryDistrict.returnGeometry = false;
                queryDistrict.outFields = ["NM3, IDN3, IDN2"];
                this.queryTaskDistrict.execute(queryDistrict, showDropdownDistrict);
                var stateStoreDistrict = new Memory({
                    data: []
                });
                var wholeArrayDistricts = [];

                function showDropdownDistrict(results) {
                    for (var i = 0; i < results.features.length; i++) {
                        stateStoreDistrict.data.push({ name: results.features[i].attributes.NM3, id_district: results.features[i].attributes.IDN3, id_region: results.features[i].attributes.IDN2 });
                    }
                    wholeArrayDistricts = stateStoreDistrict.data;
                }

                var comboBoxDistrict = new ComboBox({
                    id: "districtValue",                
                    name: "district",
                    store: stateStoreDistrict,
                    searchAttr: "name",
                    onChange: function () { changeValuesDis() }
                }, "districtValue")
                comboBoxDistrict.startup();
                /*zmena comboboxu obcí po zmene comboboxu okresov*/
                function changeValuesDis() {
                    var newArrayTowns = [];
                    if (comboBoxDistrict.item != null) {
                        for (var i = 0; i < wholeArrayTowns.length; i++) {
                            if (wholeArrayTowns[i].id_district == comboBoxDistrict.item.id_district) {
                                newArrayTowns.push({ name: wholeArrayTowns[i].name, id: comboBoxDistrict.item.id_district });
                            }
                        }
                        stateStoreTown.data = newArrayTowns;
                        comboBoxTown.set("item", "");
                    }
                }

                var queryRegion = Query();
                queryRegion.where = "NM2 is not null";
                queryRegion.returnGeometry = false;
                queryRegion.outFields = ["NM2, IDN2"];
                this.queryTaskRegion.execute(queryRegion, showDropdownRegion);

                var stateStoreRegion = new Memory({
                    data: []
                });

                function showDropdownRegion(results) {
                    for (var i = 0; i < results.features.length; i++) {
                        stateStoreRegion.data.push({ name: results.features[i].attributes.NM2, id_region: results.features[i].attributes.IDN2 });
                    }
                }

                var comboBoxRegion = new ComboBox({
                    id: "regionValue",
                    name: "region",
                    store: stateStoreRegion,
                    searchAttr: "name",
                    onChange: function () { changeValuesReg() }
                }, "regionValue")

                comboBoxRegion.startup();
                /*zmena comboboxu obcí a okresov po zmene comboboxu krajov*/
                function changeValuesReg() {
                    var newArrayDistricts = [];
                    for (var i = 0; i < wholeArrayDistricts.length; i++) {
                        if (wholeArrayDistricts[i].id_region == comboBoxRegion.item.id_region) {
                            newArrayDistricts.push({ name: wholeArrayDistricts[i].name, id_district: wholeArrayDistricts[i].id_district, id_region: comboBoxRegion.item.id_region });
                        }
                    }

                    var newArrayTowns = [];
                    for (var i = 0; i < wholeArrayTowns.length; i++) {
                        if (wholeArrayTowns[i].id_region == comboBoxRegion.item.id_region) {
                            newArrayTowns.push({ name: wholeArrayTowns[i].name, id_district: wholeArrayTowns[i].id_district, id_region: comboBoxRegion.item.id_region });
                        }
                    }
                    stateStoreDistrict.data = newArrayDistricts;
                    stateStoreTown.data = newArrayTowns;
                    comboBoxDistrict.set("item", "");
                    comboBoxTown.set("item", "");
                }
            },
            /*sky nástroj vyh¾adávania*/
            hide: function () {
                domStyle.set(this.domNode, "display", "none");
                this.map.graphics.clear();
            },
             /*spusti vyh¾adávanie*/
            executeQueryTown: function () {
                var inputValue = dom.byId("townValue");
                var query = Query();
                query.where = "NM4 = '" + inputValue.value + "'";
                query.returnGeometry = true;
                query.outFields = ["NM4, IDN4"];
                this.queryTaskTown.execute(query).addCallback(lang.hitch(this, this._onQueryComplete));
            },
            executeQueryDistrict: function () {
                var inputValue = dom.byId("districtValue");
                var query = Query();
                query.where = "NM3 = '" + inputValue.value + "'";
                query.returnGeometry = true;
                query.outFields = ["NM3, IDN3"];
                this.queryTaskDistrict.execute(query).addCallback(lang.hitch(this, this._onQueryComplete));
            },

            executeQueryRegion: function () {
                var inputValue = dom.byId("regionValue");
                var query = Query();
                query.where = "NM2 = '" + inputValue.value + "'";
                query.returnGeometry = true;
                query.outFields = ["NM2, IDN2"];
                this.queryTaskRegion.execute(query).addCallback(lang.hitch(this, this._onQueryComplete));
            },
            /*zobrazi výsledok v mapovom okne*/
            _onQueryComplete: function (results) {
                this.map.graphics.clear();
                var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([255, 255, 255]), 0.5), new Color([255, 0, 0, 0.8])
                );
                for (var i = 0; i < results.features.length; i++) {
                    var graphic = new Graphic();
                    graphic.setGeometry(results.features[i].geometry);
                    graphic.setSymbol(symbol1);
                    this.map.graphics.add(graphic);
                    this.map.setExtent(results.features[i].geometry.getExtent());
                }
            }
        });
    });
