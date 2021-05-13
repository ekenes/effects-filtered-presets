import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import Expand = require("esri/widgets/Expand");
import LayerList = require("esri/widgets/LayerList");

import { getUrlParams } from "./urlParams";
import { createFilterPanelContent } from "./layerListUtils";


( async () => {

  const { webmap } = getUrlParams();

  const map = new WebMap({
    portalItem: {
      id: webmap
    }
  });

  await map.loadAll();

  const view = new MapView({
    map: map,
    container: "viewDiv"
  });

  view.ui.add(new Expand({
    content: new Legend({ view }),
    view,
    expanded: false
  }), "bottom-left");

  const layerList = new LayerList({
    view,
    listItemCreatedFunction: (event) => {
      const item = event.item as esri.ListItem;

      item.panel = {
        className: "esri-icon-filter",
        open: true,
        title: "Filter data",
        listItem: item
      } as esri.ListItemPanel;

      createFilterPanelContent({
        panel: item.panel
      })
    }
  });
  view.ui.add(layerList, "top-right");

})();
