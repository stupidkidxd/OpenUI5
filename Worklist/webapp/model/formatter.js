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

			creationInfo: function(oModified,sModifiedFullName) {
				if(oModified){
					const oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "EEE, MMM d, yyyy",
					}).format(new Date(oModified));
					return oDateFormat;
				}
				
				return oModified;
			}

		};

	}
);