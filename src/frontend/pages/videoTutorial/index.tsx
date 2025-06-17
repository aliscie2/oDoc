import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import VideoPlayer from "./videoPlayer";
import VideoList from "./videoList";
import { tutorials } from "../LandingPage/landingPageData";


const GettingStarted = () => {
  const theme = useTheme();
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography
          variant="h3"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Getting Started with ODOC
        </Typography>

        <Card
          sx={{
            mb: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <VideoList
                  videos={tutorials}
                  selectedIndex={selectedVideoIndex}
                  onSelect={setSelectedVideoIndex}
                />
              </Grid>
              <Grid item xs={8}>
                <VideoPlayer 
                  startTime={tutorials[selectedVideoIndex].startTime} 
                  video={tutorials[selectedVideoIndex]} 
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default GettingStarted;