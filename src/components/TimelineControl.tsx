import { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Slider,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  type Theme,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";

// icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";

import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import CloseIcon from "@mui/icons-material/Close";

import type { TimeRange } from "../types/state";
import { useAppState } from "../state/appContext";
import { availableStories } from "../config/storyConfig"; // story mode

/**
 * This is the UI layer for the Timeline
 *
 * TIMERANGE is retrieved from the global application state
 */
interface TimelineControlProps {
  range: TimeRange;
  onTimeChange: (newRange: TimeRange) => void;
  onTimeChangeCommitted: (newRange: TimeRange) => void;
}
function TimelineControl({
  range,
  onTimeChange,
  onTimeChangeCommitted,
}: TimelineControlProps) {
  // get boundaries from state
  const { state, dispatch } = useAppState();
  const { min, max } = state.settings.timeRange;
  const { speed, step, defaultWindow } = state.settings.animation;
  const { isStoryModeActive, currentStoryIndex, storyManifest } = state;

  //mobile?
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  // animation
  const [isPlaying, setIsPlaying] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false); // massage dialog
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAnimation = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAnimation = () => {
    const currentDuration = range[1] - range[0];
    const totalPossibleDuration = max - min;

    // defaultWindow from config
    // because we have to change to a snippet, if full range is selected
    // for animation to work
    if (currentDuration >= totalPossibleDuration || range[1] >= max) {
      onTimeChangeCommitted([min, min + defaultWindow]);
    }

    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        const currentStart = range[0];
        const currentEnd = range[1];
        const duration = currentEnd - currentStart;
        //values set in config
        const nextStart = currentStart + step;
        const nextEnd = nextStart + duration;

        if (nextEnd <= max) {
          onTimeChangeCommitted([nextStart, nextEnd]);
        } else {
          stopAnimation();
        }
      }, speed); // values set in config
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, range, max, onTimeChangeCommitted, speed, step]);

  // TICK generator
  const marks = useMemo(() => {
    if (isMobile) return false;

    const span = max - min;
    let interval = 1;

    if (span > 500) interval = 100;
    else if (span > 200) interval = 50;
    else if (span > 100) interval = 20;
    else if (span > 50) interval = 10;
    else if (span > 20) interval = 5;
    else if (span > 10) interval = 2;

    const result = [];
    for (let i = min; i <= max; i += interval) {
      result.push({ value: i, label: `${i}` });
    }

    // to ensure the final year is visible as a label
    if (result[result.length - 1].value !== max) {
      result.push({ value: max, label: `${max}` });
    }
    return result;
  }, [min, max]);

  const themeColor = isStoryModeActive ? "info.main" : "primary.main";

  return (
    <Stack
      direction="row"
      spacing={isMobile ? 1 : 3}
      alignItems="center"
      sx={{ width: "100%" }}
    >
      {/* LEFT CONTROLS: Story Toggle + Play/Nav Buttons */}
      {isStoryModeActive ? (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Exit Story Mode">
            <IconButton
              color="error"
              onClick={() => dispatch({ type: "EXIT_STORY" })}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Previous Frame">
            <span>
              <IconButton
                color="info"
                disabled={currentStoryIndex === 0}
                onClick={() =>
                  dispatch({
                    type: "SET_STORY_FRAME",
                    payload: currentStoryIndex - 1,
                  })
                }
              >
                <SkipPreviousIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Next Frame">
            <span>
              <IconButton
                color="info"
                disabled={
                  !storyManifest ||
                  currentStoryIndex === storyManifest.frames.length - 1
                }
                onClick={() =>
                  dispatch({
                    type: "SET_STORY_FRAME",
                    payload: currentStoryIndex + 1,
                  })
                }
              >
                <SkipNextIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1}>
          {/* Enter Story Mode Button */}
          <Tooltip title="Start Story Mode">
            <IconButton
              color="info"
              onClick={() => {
                stopAnimation();
                setStoryDialogOpen(true);
                // dispatch({ type: "START_STORY", payload: sampleStory }); // un-comment if you dont want a dialog
              }}
            >
              <AutoStoriesIcon />
            </IconButton>
          </Tooltip>
          {/* Standard Play/Pause Button */}
          <Tooltip title={isPlaying ? "Pause" : "Play Time-lapse"}>
            <IconButton
              onClick={() => (isPlaying ? stopAnimation() : startAnimation())}
              color="secondary"
              sx={{ border: "1px solid", borderColor: "primary.main" }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      {/* TIMELINE SLIDER */}
      <Box sx={{ flexGrow: 1, px: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              color: themeColor,
              textTransform: "uppercase",
            }}
          >
            {isStoryModeActive ? "Story Timeline" : "Timeline"}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "monospace",
              fontWeight: "bold",
              color: isStoryModeActive ? "info.main" : "inherit",
            }}
          >
            {range[0] === range[1] ? range[0] : `${range[0]} — ${range[1]}`}
          </Typography>
        </Box>

        <Slider
          value={range}
          min={min}
          max={max}
          step={1}
          marks={marks}
          disabled={isStoryModeActive} // we lock slider during story mode
          valueLabelDisplay="auto"
          onChange={(_e, val) => {
            stopAnimation();
            onTimeChange(val as TimeRange);
          }}
          onChangeCommitted={(_e, val) =>
            onTimeChangeCommitted(val as TimeRange)
          }
          sx={{
            height: 6,
            color: themeColor,
            "& .MuiSlider-markLabel": {
              fontSize: "0.75rem",
              opacity: 0.6,
              top: "30px",
            },
            "& .MuiSlider-mark": {
              backgroundColor: themeColor,
              height: "4px",
              width: "1px",
            },
            "& .MuiSlider-track": { border: "none" },
            "& .MuiSlider-thumb": {
              height: 18,
              width: 18,
              backgroundColor: "#fff",
              border: "2px solid currentColor",
            },
          }}
        />
      </Box>

      {/* RIGHT CONTROLS*/}
      {!isStoryModeActive && (
        <Tooltip title="Reset to Full Range">
          <IconButton
            size="small"
            onClick={() => {
              stopAnimation();
              onTimeChangeCommitted([min, max]);
            }}
            sx={{ opacity: 0.5 }}
          >
            <ReplayIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {/* STORY DIALOG */}
      <Dialog
        open={storyDialogOpen}
        onClose={() => setStoryDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid rgba(255,255,255,0.1)",
            minWidth: { xs: "90vw", sm: "400px" },
          },
        }}
      >
        <DialogTitle color="info.main">Story Mode</DialogTitle>
        <DialogContent>
          <DialogContentText color="text.secondary" sx={{ mb: 2 }}>
            Starting a story will clear your current filters and reset the layer
            visibility.
          </DialogContentText>

          {/* LIST OF AVAILABLE STORIES */}
          <List
            disablePadding
            sx={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 1 }}
          >
            {availableStories.map((story, index) => (
              <Box key={story.id}>
                {index > 0 && <Divider />}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setStoryDialogOpen(false);
                      // you can dispatch in Button as well, and delete the Dialog Section
                      dispatch({ type: "START_STORY", payload: story });
                    }}
                    sx={{
                      py: 1.5,
                    }}
                  >
                    <ListItemText
                      primary={story.title}
                      secondary={`${story.author}`}
                      primaryTypographyProps={{
                        color: "info.main",
                        fontWeight: "bold",
                      }}
                      secondaryTypographyProps={{
                        color: "text.secondary",
                        variant: "caption",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStoryDialogOpen(false)} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default TimelineControl;
