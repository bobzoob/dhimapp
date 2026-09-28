import { Box, ButtonBase, Stack, Button, Typography } from "@mui/material";
import { useAppState } from "../../state/appContext";

function Header() {
  const { dispatch } = useAppState();

  const linkStyle = {
    fontSize: "0.8rem",
    color: "text.secondary",
    textTransform: "none",
    "&:hover": {
      color: "secondary.main",
      bgcolor: "transparent",
    },
    minWidth: 0,
  };

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: "primary.dark",
        paddingY: 2,
        paddingX: 3,
        zIndex: 1100,
        boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.2)",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        maxWidth="xl"
        margin="0 auto"
      >
        {/* Left side */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            sx={linkStyle}
            onClick={() => dispatch({ type: "SET_VIEW", payload: "license" })}
          >
            License
          </Button>

          <Typography
            variant="caption"
            sx={{ opacity: 0.3, color: "text.secondary" }}
          >
            |
          </Typography>

          <Button
            sx={linkStyle}
            onClick={() => dispatch({ type: "SET_VIEW", payload: "privacy" })}
          >
            Privacy Protection
          </Button>
        </Stack>

        {/* Right side */}
        <ButtonBase
          onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
          aria-label="Go to dashboard"
          sx={{
            borderRadius: 1,
            p: 0.5,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.08)",
            },
          }}
        >
          <Box
            component="img"
            src="assets/logo.png"
            alt="Project Logo"
            sx={{
              height: "55px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </ButtonBase>
      </Stack>
    </Box>
  );
}

export default Header;
