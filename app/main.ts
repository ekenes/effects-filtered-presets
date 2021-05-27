import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import Expand = require("esri/widgets/Expand");
import LayerList = require("esri/widgets/LayerList");
import ActionToggle = require("esri/support/actions/ActionToggle");
import FeatureEffect = require("esri/views/layers/support/FeatureEffect");
import BasemapGallery = require("esri/widgets/BasemapGallery");

import { getUrlParams } from "./urlParams";
import { createFilterPanelContent } from "./layerListUtils";


( async () => {

  const { webmap } = getUrlParams();

  const map = new WebMap({
    portalItem: {
      id: webmap
    }
  });

  await map.load();
  await map.loadAll();

  const view = new MapView({
    map: map,
    container: "viewDiv"
  });
  view.ui.add("titleDiv", "top-right");

  view.ui.add(new Expand({
    content: new Legend({ view }),
    view,
    expanded: false,
    group: "bottom-left"
  }), "bottom-left");

  view.ui.add(new Expand({
    content: new BasemapGallery({ view }),
    view,
    expanded: false,
    group: "bottom-left"
  }), "bottom-left");

  const lightEffects = {
    "Strong shadow": {
      includedEffect: `drop-shadow(4px, 4px, 4px, #000000)`,
      excludedEffect: ``
    },
    "Light shadow": {
      includedEffect: `drop-shadow(2px, 2px, 6px, rgb(50,50,50))`,
      excludedEffect: `opacity(50%)`
    },
    "Shadow + blur": {
      includedEffect: `drop-shadow(2px, 2px, 3px, rgb(50,50,50))`,
      excludedEffect: `blur(3px) opacity(65%)`
    },
    "Shadow + grey": {
      includedEffect: `drop-shadow(2px, 2px, 3px, rgb(50,50,50))`,
      excludedEffect: `grayscale(100%) opacity(50%)`
    },
    "Floating clouds": {
      includedEffect: `drop-shadow(10px, 10px, 15px, #000000)`,
      excludedEffect: ``
    }
  }

  const darkEffects = {
    "Bloom + opacity": {
      includedEffect: `bloom(1.3, 0.75px, 0.3)`,
      excludedEffect: `opacity(65%)`
    },
    "Bloom + blur": {
      includedEffect: `bloom(1.3, 0.75px, 0.3)`,
      excludedEffect: `blur(3px) opacity(65%)`
    },
    "Bloom + Greyscale": {
      includedEffect: `bloom(1.3, 0.75px, 0.3)`,
      excludedEffect: `grayscale(100%) opacity(65%)`
    }
  };

  const universalEffects = {
    "Muted blur": {
      includedEffect: ``,
      excludedEffect: `blur(3px) opacity(50%)`
    },
    "Muted greyscale": {
      includedEffect: ``,
      excludedEffect: `grayscale(100%) opacity(50%)`
    }
  };

  const effects = {
    ...lightEffects,
    ...darkEffects,
    ...universalEffects
  };

  const createActions = (effects:any) => Object.keys(effects).map( (key: string) => new ActionToggle({ id: key, title: key, value: false }));

  const layerList = new LayerList({
    view,
    listItemCreatedFunction: (event) => {
      const item = event.item as esri.ListItem;

      if(item.layer.type !== "feature"){
        return;
      }
      const featureLayers = view.map.allLayers
        .filter( layer => layer.type === "feature");
      const finalFeatureLayer = featureLayers.getItemAt(featureLayers.length-1);
      const showOptions = finalFeatureLayer.id === item.layer.id;

      item.actionsOpen = showOptions;

      item.actionsSections = [
        createActions(universalEffects),
        createActions(lightEffects),
        createActions(darkEffects)
      ] as any;

      item.panel = {
        className: "esri-icon-filter",
        open: showOptions,
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
    const { action, item } = event;
    const { id, value } = action as esri.ActionToggle;

    const layerView = item.layerView as esri.FeatureLayerView;

    const actions = item.actionsSections.reduce((p, c) => p.concat(c));

    actions.forEach(action => {
      (action as ActionToggle).value = (action as ActionToggle).value && action.id === id;
    });

    const filter = layerView.effect && layerView.effect.filter ? layerView.effect.filter.clone() : null;

    layerView.effect = value ? new FeatureEffect({
      filter,
      ...effects[id]
    }) : new FeatureEffect({
      filter,
      includedEffect: ``,
      excludedEffect: `opacity(0%)`
    });

  });

})();
