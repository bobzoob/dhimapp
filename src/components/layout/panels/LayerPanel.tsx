import {
  Box,
  Typography,
  Paper,
  Switch,
  Stack,
  IconButton,
  useMediaQuery,
  type Theme,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useAppState } from "../../../state/appContext";

function LayerPanel() {
  const { state, dispatch } = useAppState();
  const { layerConfig, selectedLayerId } = state;

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  const handleSelectLayer = (layerId: string) => {
    const newSelectedId = selectedLayerId === layerId ? null : layerId;
    dispatch({ type: "SELECT_LAYER", payload: newSelectedId });
  };

  // hide layer from layerPanel
  const visibleLayers = layerConfig.filter((l) => l.showInPanel !== false);

  // DYNAMIC GROUPING LOGIC
  const groupedLayers = visibleLayers.reduce((acc, layer) => {
    const groupName = layer.group || "Ungrouped";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(layer);
    return acc;
  }, {} as Record<string, typeof visibleLayers>);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* FIXED HEADER */}
      <Box
        sx={{
          p: 2,
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" color="secondary">
          Layers
        </Typography>
        <IconButton
          size="small"
          onClick={() =>
            isMobile
              ? dispatch({ type: "SET_ACTIVE_MOBILE_PANEL", payload: "none" })
              : dispatch({ type: "TOGGLE_LAYER_PANEL" })
          }
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
      </Box>

      {/* SCROLLABLE CONTENT */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, pb: 2 }}>
        {Object.entries(groupedLayers).map(([groupName, layersInGroup]) => {
          // master switch is ON only if ALL layers in the group are visible
          const isGroupVisible = layersInGroup.every((l) => l.visible);

          return (
            <Box key={groupName} sx={{ mb: 3 }}>
              {/* GROUP HEADER */}
              {groupName !== "Ungrouped" && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                    px: 1,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    pb: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="secondary.main"
                    fontWeight="bold"
                    sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                  >
                    {groupName}
                  </Typography>
                  <Switch
                    size="small"
                    color="secondary"
                    checked={isGroupVisible}
                    onChange={(e) =>
                      dispatch({
                        type: "TOGGLE_LAYER_GROUP",
                        payload: {
                          group: groupName,
                          isVisible: e.target.checked,
                        },
                      })
                    }
                  />
                </Box>
              )}

              {/* LAYERS IN THIS GROUP */}
              <Stack spacing={1.5}>
                {layersInGroup.map((layer) => {
                  const isSelected = layer.id === selectedLayerId;

                  return (
                    <Paper
                      key={layer.id}
                      className={isSelected ? "LayerCard active" : "LayerCard"}
                      elevation={isSelected ? 4 : 1}
                      onClick={() => handleSelectLayer(layer.id)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                        borderLeft: isSelected
                          ? "4px solid"
                          : "4px solid transparent",
                        borderColor: "secondary.main",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ p: 1.5 }}
                        alignItems="flex-start"
                      >
                        {/* Visibility Switch */}
                        <Switch
                          checked={layer.visible}
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(event) =>
                            dispatch({
                              type: "SET_LAYER_VISIBILITY",
                              payload: {
                                layerId: layer.id,
                                isVisible: event.target.checked,
                              },
                            })
                          }
                        />

                        {/* Text Content Area */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              sx={{
                                lineHeight: 1.2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {layer.name}
                            </Typography>
                          </Stack>

                          {layer.subtitle && (
                            <Typography
                              variant="body2"
                              sx={{
                                lineHeight: 1.2,
                                mt: 0.3,
                                fontSize: "0.8rem",
                                fontStyle: "italic",
                              }}
                            >
                              {layer.subtitle}
                            </Typography>
                          )}

                          {layer.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                marginTop: 0.8,
                                lineHeight: 1.3,
                                fontSize: "0.8rem",
                              }}
                            >
                              {layer.description}
                            </Typography>
                          )}
                          {layer.tag && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "0.6rem",
                                fontWeight: 900,
                                textTransform: "uppercase",
                                color: "secondary.main",
                                bgcolor: "rgba(255, 152, 0, 0.1)",
                                px: 0.5,
                                borderRadius: 0.5,
                                letterSpacing: "0.05em",
                              }}
                            >
                              {layer.tag}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default LayerPanel;
