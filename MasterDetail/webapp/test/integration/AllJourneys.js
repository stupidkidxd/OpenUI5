/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 jbcommon_auth_ModifiedBy in the list

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
		"zjblessons/MasterDetail/test/integration/MasterJourney",
		"zjblessons/MasterDetail/test/integration/NavigationJourney",
		"zjblessons/MasterDetail/test/integration/NotFoundJourney",
		"zjblessons/MasterDetail/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});