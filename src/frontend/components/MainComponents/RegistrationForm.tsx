import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { backendActor } from "../../utils/backendUtils";
import { RegisterUser } from "../../../declarations/backend/backend.did";
import compressImage from "@/DataProcessing/compressImage";
import { useLocation } from "react-router-dom";
import RunawayJellyfish from "../creature/runAeayJellyFish";
import { useAuth } from "@/hooks/useAuth";

// Utility function to convert File to Uint8Array
const fileToUint8Array = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

interface FormValues {
  username: string;
  bio: string;
  first_name: string;
  last_name: string;
  email: string;
}

const RegistrationForm: React.FC = () => {
  const { cleanUp } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  // Using direct backendActor import

  const [formValues, setFormValues] = useState<FormValues>({
    username: "",
    bio: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0];
    if (image) {
      // const sizeInMB = image.size / (1024 * 1024);
      try {
        const compressedImage = await compressImage(image);
        // const compressedSizeInMB = compressedImage.size / (1024 * 1024);
        // console.log(`Compressed photo size: ${compressedSizeInMB.toFixed(2)} MB`);
        setPhoto(compressedImage);
      } catch (error) {
        console.error("Error compressing image:", error);
        setPhoto(image); // Fallback to original if compression fails
      }
    }
  };

  const handleRegister = async () => {
    if (!formValues.username || !formValues.bio) {
      enqueueSnackbar("Please fill all required fields", { variant: "error" });
      return;
    }

    setLoading(true);

    try {
      // Convert photo to Uint8Array if it exists
      let photoBytes: Uint8Array | null = null;
      if (photo) {
        photoBytes = await fileToUint8Array(photo);
      }

      const input: RegisterUser = {
        name: formValues.username ? [formValues.username] : [],
        description: formValues.bio ? [formValues.bio] : [],
        photo: photoBytes ? [Array.from(photoBytes)] : [[]],
        email: formValues.email ? [formValues.email] : [],
      };

      const affiliateId = "";
      console.log({ affiliateId: "xxx" });
      const result = await backendActor.register(affiliateId, input);

      if (result?.Ok) {
        enqueueSnackbar(`Welcome ${result.Ok.name}, to Odoc`, {
          variant: "success",
        });
        window.location.href = window.location.origin;
      } else if (result?.Err) {
        enqueueSnackbar(result.Err, { variant: "error" });
      }
    } catch (error) {
      alert("Somethigng went wrong please try again in a second");
      await cleanUp();
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 3 }}>
      <Typography
        key={location.pathname}
        hidden={location.pathname == "/"}
        color="warning"
        variant="h5"
        align="center"
        sx={{ mb: 1, fontWeight: 300 }}
      >
        Please, register first.
      </Typography>
      <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 300 }}>
        Welcome to Odoc
      </Typography>

      <Typography
        variant="body2"
        align="center"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Complete your profile to get started
      </Typography>
      <RunawayJellyfish runaway={true} />

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <input
          accept="image/*"
          id="photo"
          type="file"
          style={{ display: "none" }}
          onChange={handleUploadPhoto}
        />
        <label htmlFor="photo">
          <IconButton component="span" sx={{ p: 0 }}>
            <Avatar
              src={photo ? URL.createObjectURL(photo) : undefined}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "action.hover",
                border: "2px solid",
                borderColor: "divider",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "scale(1.02)",
                },
              }}
            >
              {!photo && <Add sx={{ fontSize: 24, color: "text.secondary" }} />}
            </Avatar>
          </IconButton>
        </label>
      </Box>

      <Stack spacing={3}>
        <TextField
          required
          id="username"
          label="Username"
          fullWidth
          value={formValues.username}
          onChange={handleChange}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            id="first_name"
            label="First Name"
            fullWidth
            value={formValues.first_name}
            onChange={handleChange}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <TextField
            id="last_name"
            label="Last Name"
            fullWidth
            value={formValues.last_name}
            onChange={handleChange}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Stack>

        <TextField
          id="email"
          label="Email"
          type="email"
          fullWidth
          value={formValues.email}
          onChange={handleChange}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />

        <TextField
          id="bio"
          name="bio"
          required
          fullWidth
          multiline
          rows={3}
          aria-label="Bio"
          label="Bio"
          value={formValues.bio}
          onChange={handleChange}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <Button
          disabled={loading}
          fullWidth
          variant="contained"
          onClick={handleRegister}
          id="submitButton"
        >
          {loading ? "..." : "Complete Registration"}
        </Button>
      </Stack>
    </Box>
  );
};

export default RegistrationForm;
