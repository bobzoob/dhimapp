import { useState, useCallback, useEffect } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { useAppState } from "../state/appContext";
import { evaluateBaseFilter } from "../filters/filterUtils";

/**
 * SelectionState represents a feature selected globally (via Click or Table).
 */
export interface SelectionState {
  id: string;
  layerId: string;
  latitude: number;
  longitude: number;
  templateId?: string;
}

/**
 * HoverState represents a feature currently under the mouse
 */
export interface HoverState {
  id: string;
  layerId: string;
  latitude: number;
  longitude: number;
}

/**
 * This modul handels all listeners
 */

export function useMapInteraction() {
  const { state, dispatch } = useAppState();

  const selectedFeature = state.selectedFeature;
  const [hoverInfo, setHoverInfo] = useState<HoverState | null>(null);

  /**
   * Helper to identify which layer this mapLibre feature belongs to.
   * Strips all common MapLibre layer suffixes to match the LayerConfig ID.
   */
  const getLayerIdFromFeature = (feature: any): string => {
    return feature.source ? feature.source.replace("-source", "") : "";
  };

  /**
   * APP SELECTION LISTENER
   * Listens for custom app:select-feature events.
   * Used when clicking eye symbol in a table or an item in a HubList.
   */
  useEffect(() => {
    const handleAppSelect = (e: any) => {
      const { feature, layerId, templateId, isDrillDown } = e.detail;

      if (!feature || !layerId) return;

      // we determine coordinates for map centering
      let coords = [0, 0];
      if (feature.geometry?.type === "Point") {
        coords = feature.geometry.coordinates;
      } else if (feature.geometry?.type === "LineString") {
        coords = feature.geometry.coordinates[0]; // Center on origin
      }

      // GENERIC DRILL-DOWN:
      if (isDrillDown) {
        dispatch({
          type: "SET_HIGHLIGHTED_FEATURES",
          payload: [
            { id: String(feature.id || feature.properties?.id), layerId },
          ],
        });

        dispatch({
          type: "SET_LAYER_DRILL_DOWN",
          payload: { layerId, parentFeature: feature },
        });
      }
      // GENERIC SELECTION:
      else {
        dispatch({
          type: "SELECT_FEATURE",
          payload: {
            id: String(feature.id || feature.properties?.id),
            layerId: layerId,
            templateId: templateId,
            longitude: coords[0],
            latitude: coords[1],
          },
        });
      }
    };

    window.addEventListener("app:select-feature", handleAppSelect);
    return () =>
      window.removeEventListener("app:select-feature", handleAppSelect);
  }, [dispatch]);

  /**
   * CLICK HANDLER
   */
  // we wrapp this function in useCallback
  // to prevent listener from being recreated on every render
  const onMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (!feature) {
        dispatch({ type: "SELECT_FEATURE", payload: null });
        // if clicking empty map, clear drill-down for the currently active layer
        if (state.selectedLayerId) {
          dispatch({
            type: "SET_LAYER_DRILL_DOWN",
            payload: { layerId: state.selectedLayerId, parentFeature: null },
          });
        }
        return;
      }

      const layerId = getLayerIdFromFeature(feature);
      const config = state.layerConfig.find((l) => l.id === layerId);
      const source = state.sources[config?.sourceId || ""];

      if (!config || !source) return;

      // GENERIC LOGIC: chekc for mapping for children and config for click action
      const childKey = source.mapping.children || "children";
      const rawChildren = feature.properties[childKey];
      const hasChildren = rawChildren && rawChildren !== "[]";

      const clickAction = config.interactionConfig?.clickTrigger || "detail";

      // DDynamic Grouping
      const groupingField = config.interactionConfig?.groupingField;
      const groupingFilter = config.interactionConfig?.groupingFilter;
      if (groupingFilter || groupingField) {
        const allFeatures = state.processedData[layerId]?.features || [];

        const groupedFeatures = allFeatures.filter((f: any) => {
          // we use the advanced BaseFilter logic if provided
          if (groupingFilter) {
            // and pass the clicked feature as the referenceFeature
            return evaluateBaseFilter(f, groupingFilter, feature);
          }

          // or Fallback to groupingField logic
          let rawGroupValue = feature.properties[groupingField!];
          if (
            typeof rawGroupValue === "string" &&
            (rawGroupValue.startsWith("[") || rawGroupValue.startsWith("{"))
          ) {
            try {
              rawGroupValue = JSON.parse(rawGroupValue);
            } catch (e) {}
          }
          if (
            rawGroupValue === undefined ||
            rawGroupValue === null ||
            rawGroupValue === ""
          )
            return false;

          const groupValuesArray = Array.isArray(rawGroupValue)
            ? rawGroupValue
            : [rawGroupValue];
          let fVal = f.properties[groupingField!];
          if (
            typeof fVal === "string" &&
            (fVal.startsWith("[") || fVal.startsWith("{"))
          ) {
            try {
              fVal = JSON.parse(fVal);
            } catch (e) {}
          }
          if (fVal === undefined || fVal === null || fVal === "") return false;
          const fValArray = Array.isArray(fVal) ? fVal : [fVal];
          return fValArray.some((v: any) => groupValuesArray.includes(v));
        });

        if (groupedFeatures.length > 1) {
          const highlights = groupedFeatures.map((f: any) => ({
            id: String(f.id || f.properties?.id),
            layerId,
          }));
          dispatch({ type: "SET_HIGHLIGHTED_FEATURES", payload: highlights });

          const mockParent = {
            id: `group-${feature.id}`,
            properties: {
              ...feature.properties,
              title: `Grouped Features (${groupedFeatures.length})`,
              [childKey]: groupedFeatures,
            },
          };

          dispatch({
            type: "SET_LAYER_DRILL_DOWN",
            payload: { layerId, parentFeature: mockParent },
          });
          dispatch({ type: "SELECT_FEATURE", payload: null });
          return;
        }
      }

      // CASE: Drill-down (Hubs)
      else if (clickAction === "table" && hasChildren) {
        dispatch({
          type: "SET_HIGHLIGHTED_FEATURES",
          payload: [
            { id: String(feature.id || feature.properties?.id), layerId },
          ],
        });

        dispatch({
          type: "SET_LAYER_DRILL_DOWN",
          payload: { layerId, parentFeature: feature },
        });
        dispatch({ type: "SELECT_FEATURE", payload: null });
      }
      // CASE: Selection (individual)
      else if (config.templateId) {
        dispatch({
          type: "SELECT_FEATURE",
          payload: {
            id: String(feature.id || feature.properties?.id),
            layerId: layerId,
            templateId: undefined,
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat,
          },
        });
      }
    },
    [
      state.layerConfig,
      state.selectedLayerId,
      state.sources,
      state.processedData,
      dispatch,
    ]
  );

  /**
   * HOVER HANDLER
   */
  const onMapMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (!feature) {
        setHoverInfo(null);
        return;
      }

      const layerId = getLayerIdFromFeature(feature);
      const config = state.layerConfig.find((l) => l.id === layerId);

      if (!config || !config.templateId) {
        setHoverInfo(null);
        return;
      }

      setHoverInfo({
        id: String(feature.id || feature.properties?.id),
        layerId: layerId,
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
      });
    },
    [state.layerConfig]
  );

  const onMapMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  const closePopup = useCallback(() => {
    dispatch({ type: "SELECT_FEATURE", payload: null });
  }, [dispatch]);

  return {
    selectedFeature,
    hoverInfo,
    onMapClick,
    onMapMouseMove,
    onMapMouseLeave,
    closePopup,
  };
}
