/*global location*/
sap.ui.define([
		"zjblessons/Worklist/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/Worklist/model/formatter",
		"sap/ui/model/Sorter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/core/Fragment"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		Sorter,
		Filter,
		FilterOperator,
		MessageBox,
		MessageToast,
		Fragment
	) {
		"use strict";

		return BaseController.extend("zjblessons.Worklist.controller.Object", {

			formatter: formatter,

			onInit : function () {
				
				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
				
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						editMode: false
					});
				this.setModel(oViewModel, "objectView");
				

				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
			},

			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
				}
			},

			_onObjectMatched : function (oEvent) {
				const sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					const sObjectPath = this.getModel().createKey("/zjblessons_base_Materials", {
						MaterialID :  sObjectId
					});
					this._bindView(sObjectPath);
				}.bind(this));
			},

			_bindView : function (sObjectPath) {
				const oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding();

				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				let oResourceBundle = this.getResourceBundle(),
					oObject = oView.getBindingContext().getObject(),
					sObjectId = oObject.MaterialID,
					sObjectName = oObject.MaterialText;

				oViewModel.setProperty("/busy", false);
			},
			
			onPressEditMaterial: function(){
				this.getModel("objectView").setProperty("/editMode", true);
				this._setEditMode(true);
			},
			
			onPressSaveMaterial: function() {
				var oButton = this.getView().byId("saveButton");
				oButton.setBusy(true);
			  
				this.getModel().submitChanges({
				  success: function() {
					oButton.setBusy(false);
					sap.m.MessageToast.show("Запись успешно сохранена");
				  },
				  error: function() {
					oButton.setBusy(false);
					sap.m.MessageToast.show("Ошибка сохранения записи");
				  }
				});
			  
				this._setEditMode(false);
			  },

			onPressCancelMaterial: function(){
				this.getModel().resetChanges();
				this._setEditMode(false);
			},

			_setEditMode: function(bMode){
				this.getModel("objectView").setProperty("/editMode", bMode);

				if(bMode) {
					this._bindGroupSelect();
					this._bindSubGroupSelect();
				}
			},

			_bindGroupSelect: function(){
				this.byId("groupSelect").bindItems({
					path: "/zjblessons_base_Groups",
					template: new sap.ui.core.Item({
						key: "{GroupID}",
						text: "{GroupText}",
					}),
					sorter: new sap.ui.model.Sorter("GroupText", true),
					filters: new sap.ui.model.Filter("GroupText", sap.ui.model.FilterOperator.NE, null),
				});
			},

			_bindSubGroupSelect:function(){
				this._getSubGroupSelectTemplate().then((oTemplate) => {
					this.byId("subGroupText").bindAggregation("items", {
						path: "/zjblessons_base_SubGroups",
						template: oTemplate,
						sorter: [
							new Sorter("SubGroupText", true), 
							new Sorter({path: "Created", descending: true}),
						],
						filters: [
							new Filter("SubGroupText", FilterOperator.NE, null), 
							new Filter({path:"Created", operator: FilterOperator.BT, value1: new Date("2023-03-11"), value2: new Date()}),
						],
					});
				});
			},

			_getSubGroupSelectTemplate: function() {
				return new Promise((resolve, reject) => {
					if (!this._pSubGroupSelectTemplate){
						this._pSubGroupSelectTemplate = Fragment.load({
							id: this.getView().getId(),
							name: "zjblessons.Worklist.view.fragment.SubGroupSelectTemplate",
							controller: this,
						}).then((oTemplate) => oTemplate);
					}
					this._pSubGroupSelectTemplate.then((oTemplate) => {
						resolve(oTemplate);
					});
				});
			},
		});

	}
);