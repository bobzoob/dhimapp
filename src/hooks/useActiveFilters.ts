import { useAppState } from "../state/appContext";
import { filterRegistry } from "../filters/filterRegistry";

export interface ActiveFilterItem {
  id: string;
  label: string;
  value: string;
  moduleId: string;
  layerId?: string;
  term?: string;
  allTerms?: string[];
  isObjectFilter?: boolean;
}

export interface LayerFilterGroup {
  layerId: string;
  layerName: string;
  filters: ActiveFilterItem[];
}

export function useActiveFilters() {
  const { state } = useAppState();
  const { layerConfig, committedTimeRange, settings } = state;

  const globalFilters: ActiveFilterItem[] = [];
  const layerGroups: LayerFilterGroup[] = [];

  // Global Time Logic
  const [min, max] = [settings.timeRange.min, settings.timeRange.max];
  if (committedTimeRange[0] !== min || committedTimeRange[1] !== max) {
    globalFilters.push({
      id: "global-time-item",
      label: "Global Time",
      value: `${committedTimeRange[0]} - ${committedTimeRange[1]}`,
      moduleId: "global-time",
    });
  }

  // we iterate through ALL layers
  layerConfig.forEach((layer) => {
    const activeForThisLayer: ActiveFilterItem[] = [];

    if (layer.filterValues) {
      layer.activeFilters.forEach((config) => {
        const module = filterRegistry[config.moduleId];
        const val = layer.filterValues![config.moduleId];

        if (!module || val === undefined) return;

        // we checkif value is different from default
        const isDefault =
          JSON.stringify(val) === JSON.stringify(module.defaultValue);

        if (!isDefault) {
          const baseLabel = config.params?.activeLabel || module.label;

          // object filters with { terms, mode } (entitySearch, placeFilter)
          if (val && typeof val === "object" && Array.isArray(val.terms)) {
            const terms: string[] = val.terms;
            const modeSuffix = val.mode === "any" ? " (Any)" : "";

            terms.forEach((term, idx) => {
              activeForThisLayer.push({
                id: `${layer.id}-${config.moduleId}-${idx}-${term}`,
                label: `${baseLabel}${modeSuffix}`,
                value: module.formatValue(term, config.params),
                moduleId: config.moduleId,
                layerId: layer.id,
                term: term,
                allTerms: terms,
                isObjectFilter: true,
              });
            });
          }
          // direct array filters (plainText, sender, recipient)
          else if (Array.isArray(val)) {
            val.forEach((term: string, idx: number) => {
              activeForThisLayer.push({
                id: `${layer.id}-${config.moduleId}-${idx}-${term}`,
                label: baseLabel,
                value: module.formatValue(term, config.params),
                moduleId: config.moduleId,
                layerId: layer.id,
                term: term,
                allTerms: val,
                isObjectFilter: false,
              });
            });
          }
          // sStandard single filters (dateRange, toggles)
          else {
            activeForThisLayer.push({
              id: `${layer.id}-${config.moduleId}`,
              label: baseLabel,
              value: module.formatValue(val, config.params),
              moduleId: config.moduleId,
              layerId: layer.id,
            });
          }
        }
      });
    }
    if (activeForThisLayer.length > 0) {
      layerGroups.push({
        layerId: layer.id,
        layerName: layer.name,
        filters: activeForThisLayer,
      });
    }
  });

  return { globalFilters, layerGroups };
}
