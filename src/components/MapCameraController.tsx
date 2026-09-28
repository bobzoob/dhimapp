import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useAppState } from "../state/appContext";

/**
 * This is where the StoryMode logik is handled
 */
export function MapCameraController() {
  const { current: map } = useMap(); // we use useMap here to get refs pased down from parent
  const { state } = useAppState();

  useEffect(() => {
    if (!map) return;

    if (state.isStoryModeActive && state.storyManifest) {
      const frame = state.storyManifest.frames[state.currentStoryIndex];
      if (frame?.camera) {
        map.flyTo({
          center: frame.camera.center,
          zoom: frame.camera.zoom,
          pitch: frame.camera.pitch || 0,
          bearing: frame.camera.bearing || 0,
          duration: 2500,
          essential: true,
        });
      }
    } else if (!state.isStoryModeActive) {
      // return to default view
      map.flyTo({
        center: [
          state.settings.map.defaultCenter[1],
          state.settings.map.defaultCenter[0],
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
    map,
  ]);

  return null;
}
