import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import Expand = require("esri/widgets/Expand");
import LayerList = require("esri/widgets/LayerList");
import ActionToggle = require("esri/support/actions/ActionToggle");
import FeatureEffect = require("esri/views/layers/support/FeatureEffect");

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

  const effects = {
    "drop-shadow": {
      includedEffect: `drop-shadow(2px, 2px, 2px, black)`,
      excludedEffect: `opacity(50%) blur(2px)`
    },
    "grayscale": {
      includedEffect: ``,
      excludedEffect: `grayscale(100%)`
    },
    "blur": {
      includedEffect: ``,
      excludedEffect: `blur(10px)`
    }
  }

  const layerList = new LayerList({
    view,
    listItemCreatedFunction: (event) => {
      const item = event.item as esri.ListItem;

      item.actionsOpen = true;

      item.actionsSections = [[
        new ActionToggle({
          id: "drop-shadow",
          title: "drop shadow",
          value: false
        }),
        new ActionToggle({
          id: "grayscale",
          title: "grayscale",
          value: false
        }),
        new ActionToggle({
          id: "blur",
          title: "blur",
          value: false
        })
      ]] as any;

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

  layerList.on("trigger-action", (event) => {
    const { action: { id }, item } = event;

    const layerView = item.layerView as esri.FeatureLayerView;

    const actions = item.actionsSections.getItemAt(0);

    actions.forEach(action => {
      (action as ActionToggle).value = action.id === id;
    });

    const filter = layerView.effect && layerView.effect.filter ? layerView.effect.filter.clone() : null;

    layerView.effect = new FeatureEffect({
      filter,
      ...effects[id]
    });

  });

})();
