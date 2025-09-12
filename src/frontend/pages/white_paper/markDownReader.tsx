import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Typography,
  Link,
  Box,
  useTheme,
  Paper,
  List,
  ListItem,
  Divider,
  Tabs,
  Tab,
  AppBar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from "@mui/material";
import whitepaperText from "./md/whitepaper.md";
import promisePaper from "./md/promise.md";
import roadMap from "./md/roadmap.md";
import snsPaper from "./md/sns.md";
import architecture from "./md/architecture.md";
import jobMatch from "./md/job_match.md";

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`markdown-tabpanel-${index}`}
    aria-labelledby={`markdown-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const MarkdownRenderer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [markdownContent, setMarkdownContent] = React.useState("");
  const [currentTab, setCurrentTab] = React.useState(0);
  const [showAppBar, setShowAppBar] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const loadMarkdownFiles = async () => {
      try {
        const fetchPromises = [
          whitepaperText,
          promisePaper,
          roadMap,
          snsPaper,
          architecture,
          jobMatch
        ].map((paper) => fetch(paper).then((response) => response.text()));
        const allTexts = await Promise.all(fetchPromises);
        setMarkdownContent(allTexts.join("\n\n"));
      } catch (error) {
        console.error("Error loading markdown files:", error);
      }
    };
    loadMarkdownFiles();
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowAppBar(currentScrollY < lastScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const sections = React.useMemo(
    () =>
      markdownContent.split(/(?=^# )/gm).filter((section) => section.trim()),
    [markdownContent],
  );

  const getSectionTitle = (section) => {
    const match = section.match(/^#\s+(.+)$/m);
    return match ? match[1] : "Untitled Section";
  };

  const components = {
    h1: ({ children }) => (
      <Typography variant="h1" gutterBottom sx={{ wordBreak: "break-word" }}>
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography variant="h2" gutterBottom sx={{ wordBreak: "break-word" }}>
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="h3" gutterBottom sx={{ wordBreak: "break-word" }}>
        {children}
      </Typography>
    ),
    h4: ({ children }) => (
      <Typography variant="h4" gutterBottom sx={{ wordBreak: "break-word" }}>
        {children}
      </Typography>
    ),
    h5: ({ children }) => (
      <Typography variant="h5" gutterBottom sx={{ wordBreak: "break-word" }}>
        {children}
      </Typography>
    ),
    h6: ({ children }) => (
      <Typography variant="h6" gutterBottom sx={{ wordBreak: "break-word" }}>
        {children}
      </Typography>
    ),
    p: ({ children }) => (
      <Typography
        variant="body1"
        paragraph
        sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
      >
        {children}
      </Typography>
    ),
    a: ({ href, children }) => (
      <Link
        href={href}
        color="primary"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ wordBreak: "break-all" }}
      >
        {children}
      </Link>
    ),
    ul: ({ children }) => <List sx={{ pl: { xs: 2, sm: 4 } }}>{children}</List>,
    ol: ({ children }) => <List sx={{ pl: { xs: 2, sm: 4 } }}>{children}</List>,
    li: ({ children }) => (
      <ListItem sx={{ pl: 0 }}>
        <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
          {children}
        </Typography>
      </ListItem>
    ),
    blockquote: ({ children }) => (
      <Box
        sx={{
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          pl: 2,
          my: 2,
          bgcolor: theme.palette.background.paper,
          mx: { xs: 0, sm: 2 },
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontStyle: "italic", wordBreak: "break-word" }}
        >
          {children}
        </Typography>
      </Box>
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <Box sx={{ my: 2, overflow: "hidden", width: "100%" }}>
          <Paper elevation={2} sx={{ overflow: "auto", borderRadius: 0 }}>
            <SyntaxHighlighter
              style={tomorrow}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                fontSize: "0.75rem",
                lineHeight: 1.4,
                padding: "12px",
                overflowX: "auto",
                whiteSpace: "pre",
              }}
              wrapLines={false}
              wrapLongLines={false}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </Paper>
        </Box>
      ) : (
        <Typography
          component="code"
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[100],
            color:
              theme.palette.mode === "dark"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            padding: "2px 4px",
            borderRadius: 0,
            fontFamily: "monospace",
            wordBreak: "break-all",
            fontSize: "0.8rem",
            overflowWrap: "anywhere",
          }}
          {...props}
        >
          {children}
        </Typography>
      );
    },
    pre: ({ children }) => (
      <Box sx={{ my: 2, overflow: "hidden", width: "100%" }}>
        <Paper elevation={1} sx={{ overflow: "auto", p: 2, borderRadius: 0 }}>
          <Typography
            component="pre"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              lineHeight: 1.4,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {children}
          </Typography>
        </Paper>
      </Box>
    ),
    hr: () => <Divider sx={{ my: 2 }} />,
    table: ({ children }) => (
      <Box sx={{ my: 3, width: "100%", overflowX: "auto" }}>
        <TableContainer
          component={Paper}
          sx={{
            minWidth: 0,
            width: "100%",
            borderRadius: 0,
            "& .MuiTable-root": { tableLayout: "auto" },
          }}
        >
          <Table
            sx={{
              minWidth: 0,
              width: "100%",
              "& .MuiTableCell-root": {
                padding: { xs: "4px 8px", sm: "8px 16px" },
                fontSize: { xs: "0.7rem", sm: "0.875rem" },
                lineHeight: 1.3,
                verticalAlign: "top",
                wordBreak: "break-word",
                hyphens: "auto",
                minWidth: { xs: "60px", sm: "80px" },
              },
            }}
          >
            {children}
          </Table>
        </TableContainer>
      </Box>
    ),
    thead: ({ children }) => <TableHead>{children}</TableHead>,
    tbody: ({ children }) => <TableBody>{children}</TableBody>,
    tr: ({ children }) => <TableRow>{children}</TableRow>,
    th: ({ children }) => (
      <TableCell
        sx={{
          fontWeight: "bold",
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
          fontSize: { xs: "0.65rem", sm: "0.875rem" },
          padding: { xs: "4px 6px", sm: "8px 16px" },
          lineHeight: 1.2,
          wordBreak: "break-word",
          hyphens: "auto",
        }}
      >
        {children}
      </TableCell>
    ),
    td: ({ children }) => (
      <TableCell
        sx={{
          fontSize: { xs: "0.65rem", sm: "0.875rem" },
          padding: { xs: "4px 6px", sm: "8px 16px" },
          lineHeight: 1.3,
          wordBreak: "break-word",
          hyphens: "auto",
          verticalAlign: "top",
        }}
      >
        {children}
      </TableCell>
    ),
    img: ({ src, alt, ...props }) => (
      <Box
        sx={{ my: 2, textAlign: "center", width: "100%", overflow: "hidden" }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            maxWidth: "100%",
            width: "auto",
            height: "auto",
            display: "block",
            margin: "0 auto",
            objectFit: "contain",
          }}
          {...props}
        />
      </Box>
    ),
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <AppBar
        position="fixed"
        color="default"
        sx={{
          width: "100%",
          maxWidth: "900px",
          left: "50%",
          top: isMobile ? 0 : 45,
          transition: "transform 0.3s ease-in-out",
          transform: showAppBar
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(-100%)",
          borderRadius: 0,
          zIndex: 1100,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(event, newValue) => setCurrentTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="markdown sections"
        >
          {sections.map((section, index) => (
            <Tab
              key={index}
              label={getSectionTitle(section)}
              id={`markdown-tab-${index}`}
              aria-controls={`markdown-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </AppBar>

      <Box sx={{ mt: 6 }}>
        {sections.map((section, index) => (
          <TabPanel key={index} value={currentTab} index={index}>
            <Box
              sx={{
                maxWidth: { xs: "100vw", sm: "800px" },
                width: "100%",
                margin: "0 auto",
                padding: { xs: "8px", sm: "24px" },
                overflow: "hidden",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {section}
              </ReactMarkdown>
            </Box>
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
};

export default MarkdownRenderer;
