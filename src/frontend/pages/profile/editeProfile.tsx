import React, { useState, useEffect } from "react";
import {
  Stack,
  TextField,
  Button,
  Box,
  useTheme,
  Avatar,
  Input,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { backendActor } from "@/utils/backendUtils";
import { RegisterUser } from "$/declarations/backend/backend.did";
import { useDispatch } from "react-redux";
import compressImage from "@/DataProcessing/compressImage";

const EditProfile = ({ setIsEditing, profile, onCancel = false }) => {
  const dispatch = useDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  // Using direct backendActor import

  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    email: "",
  });

  useEffect(() => {
    if (profile) {
      setFormValues({
        name: profile.name || "",
        description: profile.description || "",
        email: profile.email || "",
      });

      // Set existing photo preview if available
      if (profile.photo && profile.photo.length > 0) {
        const blob = new Blob([new Uint8Array(profile.photo)], {
          type: "image/jpeg",
        });
        const url = URL.createObjectURL(blob);
        setPhotoPreview(url);
      }
    }
  }, [profile]);

  // Convert File/Blob to Uint8Array
  const fileToUint8Array = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(Array.from(uint8Array)); // Convert to regular array for Candid
      };
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImageChange = async (e) => {
    const image = e.target.files?.[0];
    if (image) {
      // const sizeInMB = image.size / (1024 * 1024);

      try {
        let processedImage = image;
        processedImage = await compressImage(image);
        setPhoto(processedImage);

        // Create preview URL
        const previewUrl = URL.createObjectURL(processedImage);
        setPhotoPreview(previewUrl);
      } catch (error) {
        console.error("Error processing image:", error);
        enqueueSnackbar("Error processing image", { variant: "error" });
        setPhoto(image); // Fallback to original
        const previewUrl = URL.createObjectURL(image);
        setPhotoPreview(previewUrl);
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!backendActor) {
      enqueueSnackbar("Backend not initialized", { variant: "error" });
      return;
    }

    try {
      setIsUpdating(true);

      let photoBytes = [];
      if (photo) {
        photoBytes = await fileToUint8Array(photo);
      }

      const updateData: RegisterUser = {
        name: [formValues.name],
        description: [formValues.description],
        email: [formValues.email],
        photo: photoBytes.length > 0 ? [photoBytes] : [],
      };

      const result = await backendActor?.update_user_profile(updateData);

      if (result.Ok) {
        enqueueSnackbar("Profile updated successfully", { variant: "success" });

        // result.Ok.photo is already converted to blob URL by castingActor.ts
        const updatedProfile = {
          ...result.Ok,
        };

        dispatch({ type: "UPDATE_PROFILE", profile: updatedProfile });
        setIsUpdating(false);
        setIsEditing(false);
      } else if (result.Err) {
        enqueueSnackbar(result.Err, { variant: "error" });
        setIsUpdating(false);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      enqueueSnackbar("Failed to update profile", { variant: "error" });
      setIsUpdating(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return (
    <Stack
      spacing={2}
      sx={{
        bgcolor: theme.palette.background.paper,
        p: 2,
        borderRadius: 1,
      }}
    >
      {/* Profile Photo Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar src={photoPreview} sx={{ width: 100, height: 100 }} />
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          sx={{ display: "none" }}
          id="photo-upload"
        />
        <label htmlFor="photo-upload">
          <Button variant="outlined" component="span">
            {photoPreview ? "Change Photo" : "Upload Photo"}
          </Button>
        </label>
      </Box>

      <TextField
        fullWidth
        label="Name"
        name="name"
        value={formValues.name}
        onChange={handleChange}
        variant="outlined"
        required
      />
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={formValues.email}
        onChange={handleChange}
        variant="outlined"
      />
      <TextField
        fullWidth
        label="Bio"
        name="description"
        value={formValues.description}
        onChange={handleChange}
        multiline
        rows={4}
        variant="outlined"
      />
      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ color: theme.palette.text.primary }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isUpdating}
          sx={{
            bgcolor: theme.palette.primary.main,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          {isUpdating ? "Saving..." : "Save"}
        </Button>
      </Box>
    </Stack>
  );
};

export default EditProfile;
