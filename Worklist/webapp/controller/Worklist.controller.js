/*global location history */
sap.ui.define([
		"zjblessons/Worklist/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/Worklist/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment",
		"sap/m/MessagePopover"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment, MessagePopover) {
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
					},
					Messages: [
						{
							type: 'Error',
							title: 'Error message',
							active: true,
							description: sErrorDescription,
							subtitle: 'Example of subtitle',
							counter: 1
						}, 
						{
							type: 'Warning',
							title: 'Warning without description',
							description: ''
						}, 
						{
							type: 'Success',
							title: 'Success message',
							description: 'First Success message description',
							subtitle: 'Example of subtitle',
							counter: 1
						}, 
						{
							type: 'Error',
							title: 'Error message',
							description: 'Second Error message description',
							subtitle: 'Example of subtitle',
							counter: 2
						}, 
						{
							type: 'Information',
							title: 'Information message',
							description: 'First Information message description',
							subtitle: 'Example of subtitle',
							counter: 1
						},
					],
				});
				this.setModel(oViewModel, "worklistView");

				oTable.attachEventOnce("updateFinished", function(){
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});

				
				//sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);

				var oLink = new sap.m.Link({
					text: "Show more information",
					href: "http://sap.com",
					target: "_blank"
				});
	
				var oMessageTemplate = new sap.m.MessageItem({
					type: '{worklistView>type}',
					title: '{worklistView>title}',
					activeTitle: "{worklistView>active}",
					description: '{worklistView>description}',
					subtitle: '{worklistView>subtitle}',
					counter: '{worklistView>counter}',
					link: oLink
				});
	
				var sErrorDescription = 'First Error message description. \n' +
					'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod' +
					'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
					'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo' +
					'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse' +
					'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non' +
					'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
	
				this._oMessagePopover = new MessagePopover({
					items: {
						model: "worklistView",
						path: 'worklistView>/Messages',
						template: oMessageTemplate
					},
					activeTitlePress: function () {
						MessageToast.show('Active title is pressed');
					}
				});
					
				this.byId("messagePopoverBTN").addDependent(this._oMessagePopover);
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

			_addMessageInformation: function(materialText) {
				const oViewModel = this.getModel("worklistView");
				const aMessages = oViewModel.getProperty("/Messages");
				aMessages.push({
					type: "Information",
					title: "Material Viewed",
					description: `Material ${materialText} has been viewed`,
					subtitle: "",
					counter: 1
				});
				oViewModel.setProperty("/Messages", aMessages);
			},
			
			onPressShowMaterial: function(oEvent) {
				this._showObject(oEvent.getSource());
				const materialText = oEvent.getSource().getBindingContext().getProperty("MaterialText");
				this._addMessageInformation(materialText);
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

			onPressSaveMaterial: function() {
				this._validateSaveMaterial();
			
				if (!this.getModel("worklistView").getProperty("/validateError")) {
					this.getModel().submitChanges({
						success: (oData) => {
							if (oData.__batchResponses[0].response.statusCode === "400") {
								this._addMessageCreateError(
									oData.__batchResponses[0].response.message,
									oData.__batchResponses[0].response.statusText
								);
							} else {
								this._addMessageCreate(oData);
							}
						}
					});
					this.oCreateDialog.close();
				}
			},

			_addMessageCreateError: function(sMessage,sStatusText) {
				const aMessages = this.getModel("worklistView").getProperty("/Messages");

				aMessages.push({
					type: "Error",
					title: "Not created",
					description: `Error reason: ${sMessage}`,
					subtitle: sStatusText,
					counter: 1
				});
			},

			_addMessageCreate: function(oData) {
				const aMessages = this.getModel("worklistView").getProperty("/Messages");
				const oDataResponse = oData.__batchResponses[0].__changeResponses[0].data;
				aMessages.push({
					type: "Success",
					title: "Created",
					description: `${oDataResponse.MaterialDescription}, ${oDataResponse.GroupText}, ${oDataResponse.SubGroupText}`,
					subtitle: `Material ${oDataResponse.MaterialText} has been created`,
					counter: 1
				});
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
				const sEntryPath = oEvent.getSource().getBindingContext().getPath();

				this._oDeletedMaterial = oEvent.getSource().getBindingContext().getObject();

				this.getModel().remove(sEntryPath, {
					success: () => {
						this._addMessageDeleted();
					},
					error: (oError) => {
						this._addMessageDeletedError(oError);
					}
				});
			},

			_addMessageDeleted: function() {
				const aMessages = this.getModel("worklistView").getProperty("/Messages");
				aMessages.push({
					type: "Warning",
					title: "Deleted",
					description: `${this._oDeletedMaterial.MaterialDescription}, ${this._oDeletedMaterial.GroupText}, ${this._oDeletedMaterial.SubGroupText}`,
					subtitle: `Material ${this._oDeletedMaterial.MaterialText} has been deleted`,
					counter: 1
				})
			},

			_addMessageDeletedError: function(oError) {
				const aMessages = this.getModel("worklistView").getProperty("/Messages");
				aMessages.push({
					type: "Error",
					title: "Not Deleted",
					description: `Error reason: ${oError.message}`,
					subtitle: `Material ${this._oDeletedMaterial.MaterialText} has not been deleted`,
					counter: 1
				})
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
			},

			onPressOpenActionSheet: function(oEvent) {
				const oSource = oEvent.getSource();
				if (!this._pActionSheet) {
					this._pActionSheet = Fragment.load({
						id: this.getView().getId(),
						name: "zjblessons.Worklist.view.fragment.ActionSheet",
						controller: this,
					}).then((oActionSheet) => {
						this.getView().addDependent(oActionSheet);
						return oActionSheet;
					});
				}
				this._pActionSheet.then((oActionSheet) => {
					oActionSheet.openBy(oSource);
				});
			},

			handleMessagePopoverPress: function(oEvent) {
				this._oMessagePopover.toggle(oEvent.getSource());
			},

			onOpenSelectDialog: function() {
				if(!this._pSelectDialog){
					this._pSelectDialog = Fragment.load({
						name: "zjblessons.Worklist.view.fragment.SelectDialog",
						controller: this,
						id: this.getView().getId()
					}).then(oDialog => {
						this.getView().addDependent(oDialog);
						return Promise.resolve(oDialog);
					});
				}
				this._pSelectDialog.then(oDialog => {
					oDialog.open();
					oDialog.getBinding("items").filter([]);
				})
			},
			  
			onSearch : function (oEvent) {
				const sValue = oEvent.getParameter("query") || oEvent.getParameter("newValue");

				this.byId("table").getBinding("items").filter(this._getFilters(sValue));
			},

			_getFilters: function(sValue) {
				const aFilters = [];

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
				return aFilters;
			},
		
			onSearchSelectDialog: function(oEvent) {
				const sValue = oEvent.getParameter("value");
				oEvent.getParameter("itemsBinding").filter(this._getFilters(sValue));
			}

		});
	}
);