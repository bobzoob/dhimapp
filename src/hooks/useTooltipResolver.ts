import { useAppState } from "../state/appContext";
import { popupTemplates } from "../config/templates";
import { extractGenericPopupData } from "../utils/popupUtils";
import type { HoverState } from "./useMapInteraction";

export function useTooltipResolver(hoverInfo: HoverState | null) {
  const { state } = useAppState();
  const { processedData, layerConfig, dictionaries, sources } = state;

  if (!hoverInfo) return { title: null, subtitle: null };

  // we look for the feature
  const layerData = processedData[hoverInfo.layerId];
  const feature = layerData?.features.find(
    (f: any) => String(f.id) === String(hoverInfo.id)
  );
  if (!feature) return { title: "Not found", subtitle: null };

  // we resolve config
  const layer = layerConfig.find((l) => l.id === hoverInfo.layerId);
  if (!layer) return { title: "Unknown Layer", subtitle: null };

  const sourceConfig = sources[layer.sourceId];
  const template = popupTemplates[layer.templateId];
  if (!template) return { title: layer.name, subtitle: null };

  const dictionaryId = layer.dictionaryId || sourceConfig?.dictionaryId;
  const relevantDictionary = dictionaryId ? dictionaries[dictionaryId] : {};

  // extract the data
  const popupData = extractGenericPopupData(
    feature,
    template,
    relevantDictionary
  );

  // we  have a generc header version
  let displayTitle = popupData.fields.find((f) => f.type === "header")?.value;

  // but Fallback to custom: Correspondence Logic
  if (!displayTitle) {
    const firstField = popupData.fields[0];
    if (
      firstField?.type === "custom" &&
      firstField.componentId === "CorrespondenceHeader"
    ) {
      // still not the best way to include this, not generic
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

  //fallbacks
  if (!displayTitle) {
    displayTitle =
      feature.properties.title || feature.properties.name || layer.name;
  }

  const subtitleField = popupData.fields.find((f) => f.type === "text");

  return {
    title: displayTitle,
    subtitle: subtitleField ? subtitleField.value : null,
  };
}
