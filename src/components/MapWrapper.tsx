import Map, {
  NavigationControl,
  ScaleControl,
  Popup,
  type MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { popupTemplates } from "../config/templates";
import { useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { useMapInteraction } from "../hooks/useMapInteraction"; // logic for this component

import { useAppState } from "../state/appContext";
import { layerRegistry } from "../layers/layerRegistry";
import { extractGenericPopupData } from "../utils/popupUtils";
import { Paper, Typography } from "@mui/material";

/**
 * Consumer of useMapInteraction(click listener)
 * and canvas drawer for MapLibre
 */

interface MapWrapperProps {
  children: ReactNode;
}

function MapWrapper({ children }: MapWrapperProps) {
  const mapRef = useRef<MapRef>(null); // ref to map
  const { state } = useAppState();
  const { processedData, layerConfig, dictionaries, sources, settings } = state;
  const { hoverInfo, onMapClick, onMapMouseMove, onMapMouseLeave } =
    useMapInteraction();

  // dynamic calculation of layer Ids
  const interactiveLayerIds = state.layerConfig
    .filter((layer) => layer.visible)
    .flatMap((layer) => {
      const plugin = layerRegistry[layer.type];
      return plugin ? plugin.getInteractiveIds(layer.id) : [];
    });

  // LIVE TOOLTIP
  const getTooltipContent = () => {
    if (!hoverInfo) return { title: "", subtitle: null };

    // find feature
    const layerData = processedData[hoverInfo.layerId];
    const feature = layerData?.features.find(
      (f: any) => String(f.id) === String(hoverInfo.id)
    );

    if (!feature)
      return { title: `Not found: ${hoverInfo.id}`, subtitle: null };

    // layer and source config
    const layer = layerConfig.find((l) => l.id === hoverInfo.layerId);
    if (!layer) return { title: "Unknown Layer", subtitle: null };

    const sourceConfig = sources[layer.sourceId];
    const template = popupTemplates[layer.templateId];

    if (!template) return { title: layer.name, subtitle: null };

    // resolve correct dictionary for hovered layer
    const dictionaryId = layer.dictionaryId || sourceConfig?.dictionaryId;

    // console.log("DEBUG: tooltip lookup", {
    //   lookingFor: dictionaryId,
    //   availableDictionaries: Object.keys(dictionaries),
    //   foundData: dictionaries[dictionaryId || ""],
    // });

    const relevantDictionary = dictionaryId ? dictionaries[dictionaryId] : {};

    // ectract display data
    const popupData = extractGenericPopupData(
      feature,
      template,
      relevantDictionary
    );

    // we try to find standart header
    let titleField = popupData.fields.find((f) => f.type === "header");
    let displayTitle = titleField?.value;

    // but if we dont find it we check is the first field is correspondance header (custom)
    if (!displayTitle) {
      const firstField = popupData.fields[0];
      if (
        firstField?.type === "custom" &&
        firstField.componentId === "CorrespondenceHeader"
      ) {
        // we manually resolve names for tooltip string
        const resolve = (ids: any) => {
          const idList = Array.isArray(ids) ? ids : [ids];
          return idList
            .map((id) => relevantDictionary[id]?.name || id)
            .join(", ");
        };

        const senders = resolve(feature.properties.sender_ids);
        const recipients = resolve(feature.properties.recipient_ids);
        displayTitle = `${senders} → ${recipients}`;
      }
    }

    // Fallbacks
    if (!displayTitle) {
      displayTitle =
        feature.properties.title || feature.properties.name || layer.name;
    }

    const subtitleField = popupData.fields.find((f) => f.type === "text");

    return {
      title: displayTitle,
      subtitle: subtitleField ? subtitleField.value : null,
    };
  };
  const tooltipContent = getTooltipContent();

  // camera: map adjustment for story mode
  useEffect(() => {
    if (state.isStoryModeActive && state.storyManifest) {
      const frame = state.storyManifest.frames[state.currentStoryIndex];

      if (frame && frame.camera) {
        mapRef.current?.flyTo({
          center: frame.camera.center,
          zoom: frame.camera.zoom,
          pitch: frame.camera.pitch || 0,
          bearing: frame.camera.bearing || 0,
          duration: 2500, // 2.5 seconds smooth flight
          essential: true, // tihs esures animation happens even if user prefers reduced motion
        });
      }
    } else if (!state.isStoryModeActive) {
      // we fly back to default view when exiting story mode
      mapRef.current?.flyTo({
        center: [
          state.settings.map.defaultCenter[1], // Longitude
          state.settings.map.defaultCenter[0], // Latitude
        ],
        zoom: state.settings.map.defaultZoom,
        pitch: 0,
        bearing: 0,
        duration: 2000,
      });
    }
  }, [
    state.isStoryModeActive,
    state.currentStoryIndex,
    state.storyManifest,
    state.settings.map,
  ]);

  return (
    <Map
      ref={mapRef} // ref for the camera fly
      initialViewState={{
        longitude: settings.map.defaultCenter[1],
        latitude: settings.map.defaultCenter[0],
        zoom: settings.map.defaultZoom,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={settings.map.style}
      reuseMaps={true}
      onClick={onMapClick}
      onMouseMove={onMapMouseMove}
      onMouseLeave={onMapMouseLeave}
      interactiveLayerIds={interactiveLayerIds}
      cursor={hoverInfo ? "pointer" : "grab"}
    >
      <ScaleControl position="bottom-left" />
      <NavigationControl position="top-right" showCompass={true} />

      {children}

      {/* TOOLTIP (Hover) */}
      {hoverInfo && (
        <Popup
          longitude={hoverInfo.longitude}
          latitude={hoverInfo.latitude}
          offset={[0, -10]}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          style={{ pointerEvents: "none", zIndex: 200 }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 1,
              backgroundColor: "rgba(30, 30, 30, 0.9)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              minWidth: "150px",
            }}
          >
            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
              {tooltipContent.title}
            </Typography>
            {tooltipContent.subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {tooltipContent.subtitle}
              </Typography>
            )}
          </Paper>
        </Popup>
      )}
    </Map>
  );
}

export default MapWrapper;
