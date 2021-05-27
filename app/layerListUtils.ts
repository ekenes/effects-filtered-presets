import esri = __esri;

import FeatureEffect = require("esri/views/layers/support/FeatureEffect");
import FeatureFilter = require("esri/views/layers/support/FeatureFilter");
import Slider = require("esri/widgets/Slider");
import summaryStatistics = require("esri/smartMapping/statistics/summaryStatistics");
import histogram = require("esri/smartMapping/statistics/histogram");
import HistogramRangeSlider = require("esri/widgets/HistogramRangeSlider");
import { formatNumber } from "esri/intl";

interface CreateFilterPanelParams {
  fields?: esri.Field[];
  panel: esri.ListItemPanel;
}

export function createFilterPanelContent(params: CreateFilterPanelParams){
  const { panel } = params;
  const layer = (panel.listItem.layer as esri.FeatureLayer);
  const { fields } = layer;
  const layerView = panel.listItem.layerView as esri.FeatureLayerView;

  const panelContent = document.createElement("div");
  const fieldSelect = document.createElement("select");

  const option = document.createElement("option");
  option.value = "";
  option.text = "";
  fieldSelect.appendChild(option);

  const validFieldTypes: esri.Field["type"][] = [ "double", "integer", "single", "small-integer", "long" ];

  fields
    .filter(field => validFieldTypes.indexOf(field.type) > -1)
    .forEach( field => {
      const option = document.createElement("option");
      option.value = field.name;
      option.text = field.alias;
      fieldSelect.appendChild(option);
    });

  const slider = new Slider({
    min: 0,
    max: 100,
    container: document.createElement("div"),
    values: [ 0, 100 ],
    visibleElements: {
      labels: true,
      rangeLabels: true
    },
    rangeLabelInputsEnabled: true,
    labelInputsEnabled: true,
    disabled: true,
    thumbsConstrained: false,
    labelFormatFunction: (value) => {
      // #35436 - Implementation details concerning defaults
      const minimumSignificantDigits = 2;
      const suggestedMaxDigits = Math.floor(Math.log10(Math.abs(value))) + 1;

      // Clamp 'maximumSignificantDigits' to no less than 4 (or no more than 7)... default is 4
      const maximumSignificantDigits = suggestedMaxDigits < 4 || suggestedMaxDigits > 6 ? 4 : suggestedMaxDigits;
      const compactThreshold = 1000000; // Inclusive; displays 999,999 then 1M
      const notation = Math.abs(value) >= compactThreshold ? "compact" : "standard";

      return formatNumber(value, {
        notation,
        minimumSignificantDigits,
        maximumSignificantDigits
      } as any);
    }
  });

  fieldSelect.addEventListener("change", async () => {
    slider.disabled = fieldSelect.value === "";

    const layerView = panel.listItem.layerView as esri.FeatureLayerView;
    const field = fieldSelect.value;

    const { min, max } = await summaryStatistics({
      layer,
      field
    });

    slider.set({
      max,
      min,
      values: [ min, max ]
    });

    const segment = slider.segmentElements.getItemAt(1);
    console.log(slider.segmentElements);
    segment.classList.add("included-filter");

    const where = `${field} BETWEEN ${min} AND ${max}`;
    const filter = new FeatureFilter({
      where
    });

    if(layerView.effect){
      layerView.effect.filter = filter;
    } else {
      layerView.effect = new FeatureEffect({
        filter,
        includedEffect: ``,
        excludedEffect: `opacity(0%)`
      });
    }
  });

  slider.watch("values", (values) => {
    const layerView = panel.listItem.layerView as esri.FeatureLayerView;
    const field = fieldSelect.value;

    const min = values[0] <= values[1] ? values[0] : values[1];
    const max = values[0] >= values[1] ? values[0] : values[1];

    const where = `${field} BETWEEN ${min} AND ${max}`;
    const filter = new FeatureFilter({
      where
    });

    if(layerView.effect){
      layerView.effect.filter = filter;
    } else {
      layerView.effect = new FeatureEffect({
        filter,
        includedEffect: ``,
        excludedEffect: `opacity(0%)`
      });
    }
  });

  panelContent.appendChild(fieldSelect);
  panelContent.appendChild(slider.container as HTMLElement);

  panel.content = panelContent;
}