/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblessons/MasterDetail/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblessons/MasterDetail/test/integration/pages/App",
	"zjblessons/MasterDetail/test/integration/pages/Browser",
	"zjblessons/MasterDetail/test/integration/pages/Master",
	"zjblessons/MasterDetail/test/integration/pages/Detail",
	"zjblessons/MasterDetail/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblessons.MasterDetail.view."
	});

	sap.ui.require([
		"zjblessons/MasterDetail/test/integration/NavigationJourneyPhone",
		"zjblessons/MasterDetail/test/integration/NotFoundJourneyPhone",
		"zjblessons/MasterDetail/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});