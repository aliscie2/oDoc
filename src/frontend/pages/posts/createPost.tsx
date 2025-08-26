import React, { useRef, useState } from "react";
import { Button, Card, CardContent } from "@mui/material";
import { Hash, Image as ImageIcon, Send, Smile } from "lucide-react";
import EditorComponent from "../../components/EditorComponent";
import { Post } from "../../../declarations/backend/backend.did";
import { useDispatch, useSelector } from "react-redux";
import { randomString } from "../../DataProcessing/dataSamples";
import serializeFileContents from "../../DataProcessing/serialize/serializeFileContents";
import { backendActor } from "../../utils/backendUtils";
import { useSnackbar } from "notistack";

interface CreatePostProps {
  onPostSubmit: (post: any) => void;
}

const CreatePost: React.FC<CreatePostProps> = () => {
  const { profile } = useSelector((state: any) => state.filesState);
  // Using direct backendActor import
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const postContent = useRef([]);
  const dispatch = useDispatch();
  const handleSubmit = async () => {
    const content_tree = serializeFileContents(postContent.current)[0][0][1];

    const newPostObj: Post = {
      id: randomString(),
      creator: profile.id,
      date_created: BigInt(Date.now() * 1e6),
      votes_up: [],
      tags: [],
      content_tree,
      votes_down: [],
      is_comment: false,
      children: [],
      parent: "",
    };

    setLoading(true);
    const result = await backendActor.save_post(newPostObj);

    if (result.Err) {
      enqueueSnackbar(result.Err, { variant: "error" });
    }
    setLoading(false);
    dispatch({ type: "ADD_POST", post: { ...newPostObj, creator: profile } });

    // onPostSubmit({ ...newPostObj, creator: profile });
  };

  if (!profile) {
    return <></>;
  }
  return (
    <Card className="mb-6 transition-all duration-200 hover:-translate-y-1 backdrop-blur-lg bg-background/95">
      <CardContent className="p-4">
        <div className="min-h-24 mb-4">
          {loading ? (
            "Posting..."
          ) : (
            <EditorComponent
              key={loading}
              contentEditable={true}
              onChange={(content) => {
                const c = {};
                c[""] = content;
                postContent.current = c;
              }}
              editorKey="CreatePostEditorKey"
              content={[]}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Hash className="h-5 w-5" />
            </Button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !profile}
            sx={{
              width: "100px",
              color: "white",
              borderRadius: "9999px",
              background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
              "&:hover": {
                background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
              },
              position: "relative", // Ensure button stays above shimmer
              zIndex: 2, // Higher than the shimmer
            }}
          >
            <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            {loading ? "Posting..." : "Post"}
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
