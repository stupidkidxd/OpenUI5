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
			},

			buttonIconFormatter: function(aMessages) {
				let sIcon;
				aMessages.forEach((oMessage) => {
					switch(oMessage.type) {
						case "Error":
							sIcon = "sap-icon://error";
							break;
						case "Warning":
							sIcon = sIcon === "sap-icon://error" ? "sap-icon://alert" : sIcon;
							break;
						case "Success":
							sIcon = "sap-icon://error" && sIcon === "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
							break;
						default:
							sIcon = !sIcon ? "sap-icon://information" : sIcon;
							break;
					}
				});
				return sIcon || "sap-icon://information";
			},

			buttonTypeFormatter: function(aMessages) {
				let sHighestSeverityIcon;

				aMessages.forEach(function (sMessage) {
					switch (sMessage.type) {
						case "Error":
							sHighestSeverityIcon = "Negative";
							break;
						case "Warning":
							sHighestSeverityIcon = sHighestSeverityIcon === "Negative" ? "Critical" : sHighestSeverityIcon;
							break;
						case "Success":
							sHighestSeverityIcon = sHighestSeverityIcon === "Negative" && sHighestSeverityIcon === "Critical" ? "Success" : sHighestSeverityIcon;
							break;
						default:
							sHighestSeverityIcon = !sHighestSeverityIcon ? "Neutral" : sHighestSeverityIcon;
							break;
					}
				});
				return sHighestSeverityIcon || "Neutral";
			},

			highestSeverityMessages: function(aMessages = []) {
				const sHighestSeverityIconType = this.formatter.buttonIconFormatter(aMessages);
				let sHighestSeverityMessageType;
				switch (sHighestSeverityIconType) {
					case "Negative":
						sHighestSeverityMessageType = "Error";
						break;
					case "Critical":
						sHighestSeverityMessageType = "Warning";
						break;
					case "Success":
						sHighestSeverityMessageType = "Success";
						break;
					default:
						sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
						break;
				}

				return aMessages.reduce(function (iNumberOfMessages, oMessageItem) {
					return oMessageItem.type === sHighestSeverityMessageType
						? ++iNumberOfMessages
						: iNumberOfMessages;
				}, 0);
			}

		};

	}
);