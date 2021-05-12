import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import Expand = require("esri/widgets/Expand");
import LayerList = require("esri/widgets/LayerList");

import { getUrlParams } from "./urlParams";
import { layer } from "esri/views/3d/support/LayerPerformanceInfo";


( async () => {

  const { webmap } = getUrlParams();

  const map = new WebMap({
    portalItem: {
      id: webmap
    }
  });

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
    view
  });
  view.ui.add(layerList, "top-right");

})();
