import { Popup } from "react-map-gl/maplibre";
import { Paper, Typography } from "@mui/material";
import { useTooltipResolver } from "../../hooks/useTooltipResolver";
import type { HoverState } from "../../hooks/useMapInteraction";

/**
 * This module only handels the hover popup
 */
export function MapTooltip({ info }: { info: HoverState }) {
  const { title, subtitle } = useTooltipResolver(info);

  if (!title) return null;

  return (
    <Popup
      longitude={info.longitude}
      latitude={info.latitude}
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
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {subtitle}
          </Typography>
        )}
      </Paper>
    </Popup>
  );
}
