import {
  Box,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  type Theme,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppState } from "../../../state/appContext";
import {
  useActiveFilters,
  type ActiveFilterItem,
} from "../../../hooks/useActiveFilters";

export default function ActiveFiltersPanel() {
  const { dispatch, state } = useAppState();
  const { globalFilters, layerGroups } = useActiveFilters();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  const handleClose = () => {
    isMobile
      ? dispatch({ type: "SET_ACTIVE_MOBILE_PANEL", payload: "none" })
      : dispatch({ type: "TOGGLE_ACTIVE_FILTERS_PANEL" });
  };

  const handleRemoveFilter = (filter: ActiveFilterItem) => {
    if (!filter.layerId) return;

    // if a specific term within an array we filter:
    if (filter.term !== undefined && filter.allTerms) {
      const remainingTerms = filter.allTerms.filter((t) => t !== filter.term);

      if (remainingTerms.length === 0) {
        // if no terms left we remove filter entirely
        dispatch({
          type: "REMOVE_FILTER",
          payload: { layerId: filter.layerId, moduleId: filter.moduleId },
        });
      } else {
        // if it was an object filter ({ terms, mode }) we preserve the mode
        if (filter.isObjectFilter) {
          const layer = state.layerConfig.find((l) => l.id === filter.layerId);
          const currentVal = (layer?.filterValues || {})[filter.moduleId] || {};
          dispatch({
            type: "UPDATE_FILTER_VALUE",
            payload: {
              layerId: filter.layerId,
              filterId: filter.moduleId,
              value: { ...currentVal, terms: remainingTerms },
            },
          });
        } else {
          // direct array filter
          dispatch({
            type: "UPDATE_FILTER_VALUE",
            payload: {
              layerId: filter.layerId,
              filterId: filter.moduleId,
              value: remainingTerms,
            },
          });
        }
      }
    } else {
      // filter module removal (standart)
      dispatch({
        type: "REMOVE_FILTER",
        payload: { layerId: filter.layerId, moduleId: filter.moduleId },
      });
    }
  };

  const renderFilterItem = (filter: ActiveFilterItem) => (
    <Box
      key={filter.id}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 1,
        mb: 0.5,
        bgcolor: "rgba(255,255,255,0.05)",
        borderRadius: 1,
        borderLeft: "3px solid",
        borderColor: "secondary.main",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {filter.label}
        </Typography>
        <Typography variant="body2" fontWeight="bold" noWrap>
          {filter.value}
        </Typography>
      </Box>
      <IconButton size="small" onClick={() => handleRemoveFilter(filter)}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* HEADER */}
      <Box
        sx={{
          p: 2,
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6">Active Filters</Typography>
        <IconButton size="small" onClick={handleClose}>
          <KeyboardArrowLeftIcon />
        </IconButton>
      </Box>

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        {globalFilters.length === 0 && layerGroups.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic", textAlign: "center", mt: 4 }}
          >
            No active filters.
          </Typography>
        )}

        {/* GLOBAL FILTERS */}
        {globalFilters.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="primary"
              sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
            >
              Global
            </Typography>
            {globalFilters.map(renderFilterItem)}
          </Box>
        )}

        {/* LAYER SPECIFIC FILTERS */}
        {layerGroups.map((group) => (
          <Box key={group.layerId} sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="secondary"
              sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
            >
              {group.layerName}
            </Typography>
            {group.filters.map(renderFilterItem)}
          </Box>
        ))}
      </Box>

      {/* FOOTER */}
      {(globalFilters.length > 0 || layerGroups.length > 0) && (
        <Box sx={{ p: 2, flexShrink: 0, borderTop: 1, borderColor: "divider" }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DeleteIcon />}
            fullWidth
            onClick={() => dispatch({ type: "CLEAR_ALL_FILTERS" })}
          >
            Reset All
          </Button>
        </Box>
      )}
    </Box>
  );
}
