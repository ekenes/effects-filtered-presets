import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import { getUrlParams } from "./urlParams";


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

})();
