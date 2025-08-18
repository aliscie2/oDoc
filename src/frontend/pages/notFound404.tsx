import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Home } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";

export default function NotFound() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          py: 4,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: isMobile ? "6rem" : "10rem",
            fontWeight: "bold",
            color: "primary.main",
            lineHeight: 1,
            mb: 2,
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontSize: isMobile ? "1.5rem" : "2.125rem",
            fontWeight: 500,
            color: "text.primary",
            mb: 2,
          }}
        >
          Page Not Found
        </Typography>
        <RunawayJellyfish
          runaway={true}
          logoSvgScale={isMobile ? 1.2 : 3}
          thinking={true}
          scale={isMobile ? 1 : 2}
        />
        <Typography
          variant="body1"
          sx={{
            fontSize: isMobile ? "1rem" : "1.125rem",
            color: "text.secondary",
            mb: 4,
            maxWidth: "500px",
          }}
        >
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
            }}
            onClick={() => navigate("/")}
          >
            Go Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
