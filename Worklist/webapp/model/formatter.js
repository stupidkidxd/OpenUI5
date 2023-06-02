sap.ui.define([
	] , function () {
		"use strict";

		return {

			/**
			 * Rounds the number unit value to 2 digits
			 * @public
			 * @param {string} sValue the number string to be rounded
			 * @returns {string} sValue with 2 digits rounded
			 */
			numberUnit : function (sValue) {
				if (!sValue) {
					return "";
				}
				return parseFloat(sValue).toFixed(2);
			},

			creationInfo: function(oModified,sModifiedFullName) { //5.10
				if(oModified){
					const oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "EEE, MMM d, yyyy",
					}).format(new Date(oModified));
					return oDateFormat;
				}
				
				return oModified;
			},

			formatName: function(sName) {
				return sName.split(" ")
					.map((sPart, index) => index === 0 ? `${sPart[0]}.`: sPart)
					.join(" ");
			}

		};

	}
);