import { canisterId, idlFactory } from "$/declarations/backend";
import compressImage from "@/DataProcessing/compressImage";
import { useAuth } from "@/hooks/useAuth";
import { Add } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { RegisterUser } from "../../../declarations/backend/backend.did";
import { ActorFactory } from "../../utils/actorFactory";

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
  const location = useLocation();

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
      try {
        const compressedImage = await compressImage(image);
        setPhoto(compressedImage);
      } catch (error) {
        console.error("Error compressing image:", error);
        setPhoto(image);
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

      const result = await ActorFactory.executeWithRecovery(
        {
          canisterId,
          idlFactory,
          actorType: "backend",
        },
        (actor) =>
          actor.register(localStorage.getItem("affiliateId") || "", input),
      );

      if (result && "Ok" in result) {
        enqueueSnackbar(`Welcome ${result.Ok.name}, to Odoc`, {
          variant: "success",
        });
        window.location.href = window.location.origin;
      } else if (result && "Err" in result) {
        enqueueSnackbar(result.Err, { variant: "error" });
      } else {
        throw new Error("Registration failed - no result returned");
      }
    } catch (error) {
      alert("Something went wrong please try again in a second");
      await cleanUp();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100vw", px: 2, py: 3 }}>
      <Box sx={{ maxWidth: 380, mx: "auto" }}>
        {location.pathname !== "/" && (
          <Typography
            color="warning"
            variant="h6"
            align="center"
            sx={{ mb: 1 }}
          >
            Please, register first.
          </Typography>
        )}
        <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 300 }}>
          Welcome to {window.location.hostname}
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Complete your profile to get started
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
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
                  width: 70,
                  height: 70,
                  bgcolor: "action.hover",
                  border: "2px solid",
                  borderColor: "divider",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                {!photo && <Add sx={{ fontSize: 20 }} />}
              </Avatar>
            </IconButton>
          </label>
        </Box>

        <Stack spacing={2.5}>
          <TextField
            required
            id="username"
            label="Username"
            fullWidth
            value={formValues.username}
            onChange={handleChange}
            size="small"
          />
          <TextField
            id="first_name"
            label="First Name"
            fullWidth
            value={formValues.first_name}
            onChange={handleChange}
            size="small"
          />
          <TextField
            id="last_name"
            label="Last Name"
            fullWidth
            value={formValues.last_name}
            onChange={handleChange}
            size="small"
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            fullWidth
            value={formValues.email}
            onChange={handleChange}
            size="small"
          />
          <TextField
            id="bio"
            required
            fullWidth
            multiline
            rows={3}
            label="Bio"
            value={formValues.bio}
            onChange={handleChange}
            size="small"
          />
          <Button
            disabled={loading}
            fullWidth
            variant="contained"
            onClick={handleRegister}
            sx={{ mt: 1 }}
          >
            {loading ? "..." : "Complete Registration"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default RegistrationForm;
