var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "esri/views/layers/support/FeatureEffect", "esri/views/layers/support/FeatureFilter", "esri/widgets/Slider", "esri/smartMapping/statistics/summaryStatistics", "esri/intl"], function (require, exports, FeatureEffect, FeatureFilter, Slider, summaryStatistics, intl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createFilterPanelContent(params) {
        var _this = this;
        var panel = params.panel;
        var layer = panel.listItem.layer;
        var fields = layer.fields;
        var layerView = panel.listItem.layerView;
        var panelContent = document.createElement("div");
        var fieldSelect = document.createElement("select");
        var option = document.createElement("option");
        option.value = "";
        option.text = "";
        fieldSelect.appendChild(option);
        var validFieldTypes = ["double", "integer", "single", "small-integer", "long"];
        fields
            .filter(function (field) { return validFieldTypes.indexOf(field.type) > -1; })
            .forEach(function (field) {
            var option = document.createElement("option");
            option.value = field.name;
            option.text = field.alias;
            fieldSelect.appendChild(option);
        });
        var slider = new Slider({
            min: 0,
            max: 100,
            container: document.createElement("div"),
            values: [0, 100],
            visibleElements: {
                labels: true,
                rangeLabels: true
            },
            rangeLabelInputsEnabled: true,
            labelInputsEnabled: true,
            disabled: true,
            thumbsConstrained: false,
            labelFormatFunction: function (value) {
                // #35436 - Implementation details concerning defaults
                var minimumSignificantDigits = 2;
                var suggestedMaxDigits = Math.floor(Math.log10(Math.abs(value))) + 1;
                // Clamp 'maximumSignificantDigits' to no less than 4 (or no more than 7)... default is 4
                var maximumSignificantDigits = suggestedMaxDigits < 4 || suggestedMaxDigits > 6 ? 4 : suggestedMaxDigits;
                var compactThreshold = 1000000; // Inclusive; displays 999,999 then 1M
                var notation = Math.abs(value) >= compactThreshold ? "compact" : "standard";
                return intl_1.formatNumber(value, {
                    notation: notation,
                    minimumSignificantDigits: minimumSignificantDigits,
                    maximumSignificantDigits: maximumSignificantDigits
                });
            }
        });
        fieldSelect.addEventListener("change", function () { return __awaiter(_this, void 0, void 0, function () {
            var layerView, field, _a, min, max, segment, where, filter;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        slider.disabled = fieldSelect.value === "";
                        layerView = panel.listItem.layerView;
                        field = fieldSelect.value;
                        return [4 /*yield*/, summaryStatistics({
                                layer: layer,
                                field: field
                            })];
                    case 1:
                        _a = _b.sent(), min = _a.min, max = _a.max;
                        slider.set({
                            max: max,
                            min: min,
                            values: [min, max]
                        });
                        segment = slider.segmentElements.getItemAt(1);
                        console.log(slider.segmentElements);
                        segment.classList.add("included-filter");
                        where = field + " BETWEEN " + min + " AND " + max;
                        filter = new FeatureFilter({
                            where: where
                        });
                        if (layerView.effect) {
                            layerView.effect.filter = filter;
                        }
                        else {
                            layerView.effect = new FeatureEffect({
                                filter: filter,
                                includedEffect: "",
                                excludedEffect: "opacity(0%)"
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); });
        slider.watch("values", function (values) {
            var layerView = panel.listItem.layerView;
            var field = fieldSelect.value;
            var min = values[0] <= values[1] ? values[0] : values[1];
            var max = values[0] >= values[1] ? values[0] : values[1];
            var where = field + " BETWEEN " + min + " AND " + max;
            var filter = new FeatureFilter({
                where: where
            });
            if (layerView.effect) {
                layerView.effect.filter = filter;
            }
            else {
                layerView.effect = new FeatureEffect({
                    filter: filter,
                    includedEffect: "",
                    excludedEffect: "opacity(0%)"
                });
            }
        });
        panelContent.appendChild(fieldSelect);
        panelContent.appendChild(slider.container);
        panel.content = panelContent;
    }
    exports.createFilterPanelContent = createFilterPanelContent;
});
//# sourceMappingURL=layerListUtils.js.map