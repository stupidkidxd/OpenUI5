/*global location */
sap.ui.define([
		"zjblessons/MasterDetail/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/MasterDetail/model/formatter",
		"sap/m/VBox",
		"sap/m/Panel",
		"sap/ui/table/Table",
		"sap/ui/table/Column"
	], function (BaseController, JSONModel, formatter, VBox, Panel, Table, Column) {
		"use strict";

		return BaseController.extend("zjblessons.MasterDetail.controller.Detail", {

			formatter: formatter,
			
			_oViewModel:new JSONModel({
				masterItem:"",
				count: "",
			}),
			
			onInit : function () {
				this.getRouter()
				.getRoute("object")
				.attachPatternMatched(this._onObjectMatched, this);
				
				this.setModel(this._oViewModel, "detailView");
			},
			
			_onObjectMatched : function (oEvent) {
				let sEntity = oEvent.getParameter("arguments").entity;
				
				this.getModel("detailView").setProperty("/masterItem", sEntity);
				
				switch ("All") {
					case sEntity:
						this._createPanel();
						break;
					default:
						if (this.byId(sEntity).getBinding("rows")) {
							this.byId(sEntity).getBinding("rows").refresh();
						} else {
							this.byId(sEntity).bindRows({
								path: "/zjblessons_base_" + sEntity,
								events:{
									dataReceived: this.setCount.bind(this),
								},
								template: new sap.ui.table.Row({}),
							});
						}
				}
				
				this.byId("thDetail").setText(
					this.getModel("i18n")
					.getResourceBundle()
					.getText("t" + sEntity)
				);
				
			},
			
			setCount: function(oEvent) {
				this.getModel("detailView").setProperty(
					"/count",
					"(" + oEvent.getSource().getLength() + ")"
					);
			},
			
			_createPanel: function() {
				if (!this.oPanels) {
					this.oPanels = new VBox({
						visible:"{= (${detailView>/masterItem}) === 'All'}",
						items: [
							new Panel({
								expandable: true,
								headerText:"{i18n>/tGroups}",
								content: [
									(this.oGroups = new Table({
										columns: [
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "GroupID",
												}),
												template: new sap.m.Text({
													text: "{GroupID}",
												}),
											}),
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "GroupText",
												}),
												template: new sap.m.Text({
													text: "{GroupText}",
												}),
											}),
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "GroupDescription",
												}),
												template: new sap.m.Text({
													text: "{GroupDescription}",
												}),
											}),
											],
									})),
									],
							}),
							
							new Panel({
								expandable: true,
								headerText:"{i18n>/tSubGroups}",
								content: [
									(this.oSubGroups = new Table({
										columns: [
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "SubGroupID",
												}),
												template: new sap.m.Text({
													text: "{SubGroupID}",
												}),
											}),
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "SubGroupText",
												}),
												template: new sap.m.Text({
													text: "{SubGroupText}",
												}),
											}),
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "IntergationID",
												}),
												template: new sap.m.Text({
													text: "{IntergationID}",
												}),
											}),
											],
									})),
									],
							}),
							
							new Panel({
								expandable: true,
								headerText:"{i18n>/tPlants}",
								content: [
									(this.oPlants = new Table({
										columns: [
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "PlantID",
												}),
												template: new sap.m.Text({
													text: "{PlantID}",
												}),
											}),
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "PlantText",
												}),
												template: new sap.m.Text({
													text: "{PlantText}",
												}),
											}),
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "RegionID",
												}),
												template: new sap.m.Text({
													text: "{RegionID}",
												}),
											}),
											],
									})),
									],
							}),
							
							new Panel({
								expandable: true,
								headerText:"{i18n>/tRegions}",
								content: [
									(this.oRegions = new Table({
										columns: [
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "RegionID",
												}),
												template: new sap.m.Text({
													text: "{RegionID}",
												}),
											}),
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "RegionText",
												}),
												template: new sap.m.Text({
													text: "{RegionText}",
												}),
											}),
											new Column({
												width: "auto",
												label: new sap.m.label({
													text: "CreatedByFullName",
												}),
												template: new sap.m.Text({
													text: "{CreatedByFullName}",
												}),
											}),
											],
									})),
									],
							}),
							
							],
					});
					
					this.oGroups.bindRows({
						path: "/zjblessons_base_Groups",
						template: new sap.ui.table.Row({}),
					});
					this.oSubGroups.bindRows({
						path: "/zjblessons_base_SubGroups",
						template: new sap.ui.table.Row({}),
					});
					this.oRegions.bindRows({
						path: "/zjblessons_base_Regions",
						template: new sap.ui.table.Row({}),
					});
					this.oPlants.bindRows({
						path: "/zjblessons_base_Plants",
						template: new sap.ui.table.Row({}),
					});
					this.byId('contentVBox').addItem(this.oPanels);
				}	
			},
		}
	);
	}
);