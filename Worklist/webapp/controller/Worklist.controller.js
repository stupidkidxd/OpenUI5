/*global location history */
sap.ui.define([
		"zjblessons/Worklist/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/Worklist/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment) {
		"use strict";

		return BaseController.extend("zjblessons.Worklist.controller.Worklist", {

			formatter: formatter,

			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");

				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			
				this._aTableSearchState = [];

				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0,
					validateError: false,
					dialogParams: {
						height: "400px",
						width: "250px",
					}
				});
				this.setModel(oViewModel, "worklistView");

				oTable.attachEventOnce("updateFinished", function(){
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
				//sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			},

			onUpdateFinished : function (oEvent) {
				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");
				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},

			onPressShowMaterial : function (oEvent) {
				this._showObject(oEvent.getSource());
			},
			
			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("MaterialID")
				});
			},

			onNavBack : function() {
				history.go(-1);
			},

			_loadCreateFragment: function(oEntryContext){
				if(!this.oCreateDialog){
					this.pCreateMaterial = Fragment.load({
						name: "zjblessons.Worklist.view.fragment.CreateMaterial",
						controller: this,
						id: "fCreateDialog"
					}).then(oDialog => {
						this.oCreateDialog = oDialog;
						this.getView().addDependent(this.oCreateDialog);
						return Promise.resolve(oDialog);
					});
				}
				this.pCreateMaterial.then(oDialog => {
					oDialog.setEscapeHandler(this._pEscapeHandler.bind(this));
					oDialog.setBindingContext(oEntryContext);
					oDialog.open();
				})
			},

			_pEscapeHandler: function(oPromise) {
				if(!this.oConfirmEscapePressPreventDialog) {
					this.oConfirmEscapePressPreventDialog = new sap.m.Dialog({
						title: "Are u sure?",
						content: new sap.m.Text({
							text: "Ur changes will be lost",
						}),
						type: sap.m.DialogType.Message,
						icon: sap.ui.core.IconPool.getIconURI("message-information"),
						buttons: [
							new sap.m.Button({
								text: "Yes",
								press: function(){
									this.oConfirmEscapePressPreventDialog.close();
									this.oCreateDialog.close();
								}.bind(this),
							}),
							new sap.m.Button({
								text: "No",
								press: function(){
									this.oConfirmEscapePressPreventDialog.close();
								}.bind(this),
							}),
						],
					});
				}
				this.oConfirmEscapePressPreventDialog.open();
			},

			_clearCreateDialog: function(){
				[
					Fragment.byId("fCreateDialog", "iMaterialText"),
					Fragment.byId("fCreateDialog", "iRating"),
					Fragment.byId("fCreateDialog", "cbGroupID"),
					Fragment.byId("fCreateDialog", "cbSubGroupID"),
				].forEach(oControl => oControl.setValueState("None"));
			},
			
			_validateSaveMaterial: function() {
				[
					Fragment.byId("fCreateDialog", "iMaterialText"),
					Fragment.byId("fCreateDialog", "iRating"),
					Fragment.byId("fCreateDialog", "cbGroupID"),
					Fragment.byId("fCreateDialog", "cbSubGroupID"),
				].forEach(oControl => {
					oControl.fireValidateFieldGroup();
				})	
			},

			onPressSaveMaterial: function(){
				this._validateSaveMaterial();
				
				if (!this.getModel("worklistView").getProperty("/validateError")) {
					this.getModel().submitChanges();
					this.oCreateDialog.close();
				}
			},

			onPressCloseCreateDialog: function(){
				this.getModel().resetChanges();
				this.oCreateDialog.close();
			},

			onPressCreateMaterial: function() {
				const mProperties = {
					MaterialID: "0",
					Version: "A",
					Language: "RU"
				};
				const oEntryContext = this.getModel().createEntry("/zjblessons_base_Materials", {
					properties: mProperties
				});
				this._loadCreateFragment(oEntryContext);
			},

			onSearch : function (oEvent) {
				const aFilters = [];
				const sValue = oEvent.getParameter("query") || oEvent.getParameter("newValue");

				if (sValue){
					aFilters.push(
						new Filter({
							filters: [
								new Filter("MaterialText", FilterOperator.Contains, sValue),
								new Filter({
									path: "MaterialDescription", 
									operator: FilterOperator.Contains, 
									value1: sValue,
								}),
							
						new Filter({
							filters: [
								new Filter('CreatedByFullName', FilterOperator.Contains, sValue),
								new Filter('ModifiedByFullName', FilterOperator.Contains, sValue),
							],
							and: true,
							})
						],
						and:false,
						})
					);
				}
				this.byId("table").getBinding("items").filter(aFilters);
			},
		
			onPressRefresh: function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

				_applySearch: function(aTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			},

			onPressDeleteMaterial: function (oEvent) {
				const oSelectedItem = oEvent.getSource();
				const oBindingContext = oSelectedItem.getBindingContext();
				const sPath = oBindingContext.getPath();
			  
				sap.m.MessageBox.show("Вы действительно желаете удалить запись?", {
				  icon: sap.m.MessageBox.Icon.WARNING,
				  title: "Подтверждение удаления",
				  actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				  onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
					  oBindingContext.getModel().remove(sPath);
					  sap.m.MessageToast.show("Запись успешно удалена");
					} else {
					  sap.m.MessageToast.show("Удаление отменено");
					}
				  }
				});
			  },

			  onChangeMaterialText: function(oEvent) {
				const oSource = oEvent.getSource();
				if (!oSource.getValue()) {
					oSource.setValueState("Error");			//mozhno napisat' oSource.setValueState.Error
				}
			  },
			  
			  onValidateFieldGroup: function(oEvent) {
			  	const oControl = oEvent.getSource();
			  	let bSuccess = true;
			  	let sErrorText;
			  	switch (oEvent.getSource().getFieldGroupIds()[0]) {
					case "ratingField":
						const sRatingValue = oControl.getValue();
						const oRatingRegex = /^[0-9]{1}\.[0-9]{2}$/;
						bSuccess = oRatingRegex.test(sRatingValue);
						sErrorText = "Enter a valid rating (e.g., 1.45)!";
						break;
			  		case "input":
			  			bSuccess = !!oControl.getValue();
			  			sErrorText = "Enter Text!";
			  			break;
					case "comboBox":
						bSuccess = oControl.getItems().includes(oControl.getSelectedItem());
						sErrorText = "Select value!";
			  	}
			  	this.getModel("worklistView").setProperty("/validateError", !bSuccess);
			  	oControl.setValueState(bSuccess ? "None" : "Error");
			  	oControl.setValueStateText(sErrorText);
			  },

			  onBeforeCloseDialog: function(oEvent) {
				const oSource = oEvent.getSource();
				const oDialogSize = oEvent.getSource()._oManuallySetSize;
				if(oDialogSize) {
					this.getModel("worklistView").setProperty("/dialogParams/height", oDialogSize.height + "px");
					this.getModel("worklistView").setProperty("/dialogParams/width", oDialogSize.width + "px");
				} else {
					oEvent.getSource().destroy();
					this.oCreateDialog = null;
				}
				this._clearCreateDialog();
			  },

			  onPressMaterialInfo: function(oEvent) {
				const oSource = oEvent.getSource();
				if (!this._pPopover){
					this._pPopover = Fragment.load({
						id: this.getView().getId(),
						name: "zjblessons.Worklist.view.fragment.Popover",
						controller: this,
					}).then((oPopover) => {
						this.getView().addDependent(oPopover);
						return oPopover;
					});
				}
				this._pPopover.then((oPopover) => {
					oPopover.setBindingContext(oSource.getBindingContext());
					oPopover.openBy(oSource);
				})
			  },

			  onPressClosePopover: function(oEvent) {
				oEvent.getSource().getParent().getParent().close(); //использовать getParent только тогда, когда структура конст
			  },

			  onPressGoToMaterial: function(oEvent) {
				this._showObject(oEvent.getSource());			
			  }

		});
	}
);