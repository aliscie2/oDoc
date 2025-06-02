import * as React from 'react';
import { Job } from '$/declarations/backend/backend.did';
import { 
    Box, 
    Typography, 
    Divider, 
    Paper, 
    Chip, 
    Stack, 
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    CardContent,
    Grid,
    Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '@/utils/time';
import { useSelector } from 'react-redux';

interface JobDetailsProps {
    job: Job;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job }) => {
    const [expandedSection, setExpandedSection] = React.useState<string | false>('basic');
    const { profile } = useSelector((state: any) => state.filesState);

    // Helper function to format field names
    const formatFieldName = (key: string) => {
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    };

    // Get basic info fields (filtered to exclude specified fields)
    const basicInfoFields = Object.keys(job)
        .filter(key => 
            !Array.isArray(job[key as keyof Job]) && 
            key !== 'category' && 
            key !== 'date_created' &&
            key !== 'date_updated' &&
            key !== 'user_id' &&
            key !== 'active' &&
            
            key !== 'description' &&
            key !== 'cover_letter' &&
            key !== 'trust_note' &&
            job[key as keyof Job] !== undefined
        );

    // Get array fields
    const arrayFields = Object.keys(job).filter(key => {
        const value = job[key as keyof Job];
        return Array.isArray(value) && 
               key !== 'matches' && 
               
               key !== 'emails' &&
               value.length > 0;
    });

    const handleAccordionChange = (panel: string) => (
        event: React.SyntheticEvent,
        isExpanded: boolean,
    ) => {
        setExpandedSection(isExpanded ? panel : false);
    };

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 4, 
                maxWidth: 900, 
                mx: 'auto',
                borderRadius: 3
            }}
        >
            {/* Header Section */}
            <Box sx={{ 
                textAlign: 'center', 
                mb: 4,
                position: 'relative'
            }}>
                {/* Job Title */}
                {job.job_titles && (
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ 
                            mb: 2, 
                            fontWeight: 800,
                            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        {job.job_titles[0]}
                    </Typography>
                )}

                {/* Status and Actions Row */}
                <Stack 
                    direction="row" 
                    spacing={2} 
                    justifyContent="center" 
                    alignItems="center"
                    sx={{ mb: 3 }}
                >
                    {/* Active Status */}
                    <Chip
                        icon={job.active ? <CheckCircleIcon /> : <PauseCircleIcon />}
                        label={job.active ? "Active" : "Inactive"}
                        color={job.active ? "success" : "default"}
                        variant="filled"
                        sx={{ 
                            fontWeight: 'bold',
                            px: 2,
                            py: 1,
                            height: 'auto'
                        }}
                    />

                    {/* Profile Link or Owner Indicator */}
                    {profile.id === job.user_id ? (
                        <Chip
                            label="Created by You"
                            color="primary"
                            variant="filled"
                            sx={{
                                fontWeight: 'bold',
                                px: 2,
                                py: 1,
                                height: 'auto'
                            }}
                        />
                    ) : (
                        <Button
                            component={Link}
                            to={`/user/?id=${job.user_id}`}
                            variant="outlined"
                            startIcon={<PersonIcon />}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1
                            }}
                        >
                            View Profile
                        </Button>
                    )}
                </Stack>

                {/* Timestamps */}
                <Stack direction="row" spacing={3} justifyContent="center">
                    <Typography variant="body2" color="text.secondary">
                        Created: {formatRelativeTime(job.date_created)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Updated: {formatRelativeTime(job.date_updated)}
                    </Typography>
                    
                </Stack>
            </Box>

            {/* Description Section */}
            {job.description && (
                <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <DescriptionIcon />
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontWeight: 700
                                }}
                            >
                                Description
                            </Typography>
                        </Stack>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                lineHeight: 1.7,
                                fontSize: '1.1rem',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {job.description}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Cover Letter Section */}
            {job.cover_letter && (
                <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: 1,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <EmailIcon />
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontWeight: 700
                                }}
                            >
                                Cover Letter
                            </Typography>
                        </Stack>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                lineHeight: 1.7,
                                fontSize: '1.1rem',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {job.cover_letter}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Trust Note Section */}
            {job.trust_note && (
                <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: 1,
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <VerifiedUserIcon />
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontWeight: 700
                                }}
                            >
                                Trust Note
                            </Typography>
                        </Stack>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                lineHeight: 1.7,
                                fontSize: '1.1rem',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {job.trust_note}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics Grid */}
            {basicInfoFields.length > 0 && (
                <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: 1
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography 
                            variant="h5" 
                            gutterBottom 
                            sx={{ 
                                fontWeight: 700,
                                color: 'primary.main',
                                mb: 3,
                                textAlign: 'center'
                            }}
                        >
                            Job Details
                        </Typography>
                        <Grid container spacing={3}>
                            {/* Display emails first if they exist */}
                            {job.emails && job.emails.length > 0 && (
                                <Grid item xs={12}>
                                    <Box sx={{ 
                                        p: 2,
                                        borderRadius: 2,
                                        border: 1,
                                        borderColor: 'divider',
                                        minHeight: 80,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ 
                                                fontWeight: 500,
                                                mb: 1
                                            }}
                                        >
                                            Emails
                                        </Typography>
                                        <Stack spacing={0.5}>
                                            {job.emails.map((email, index) => (
                                                <Typography 
                                                    key={index}
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 700,
                                                        wordBreak: 'break-word',
                                                        color: 'primary.main'
                                                    }}
                                                >
                                                    {email}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Grid>
                            )}
                            
                            {basicInfoFields.map((key) => {
                                const value = job[key as keyof Job];
                                if (!value) return null;
                                
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={key}>
                                        <Box sx={{ 
                                            p: 2,
                                            borderRadius: 2,
                                            border: 1,
                                            borderColor: 'divider',
                                            minHeight: 80,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                                sx={{ 
                                                    fontWeight: 500,
                                                    mb: 0.5
                                                }}
                                            >
                                                {formatFieldName(key)}
                                            </Typography>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    fontWeight: 700,
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {String(value)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Array Fields Accordions */}
            {arrayFields.map((fieldName) => {
                const fieldValue = job[fieldName as keyof Job] as string[];
                if (!fieldValue || fieldValue.length === 0) return null;

                return (
                    <Accordion 
                        key={fieldName}
                        expanded={expandedSection === fieldName} 
                        onChange={handleAccordionChange(fieldName)}
                        sx={{
                            mb: 2,
                            borderRadius: '12px !important',
                            boxShadow: 1,
                            '&:before': {
                                display: 'none',
                            },
                            '&.Mui-expanded': {
                                margin: '0 0 16px 0'
                            }
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon color="primary" />}
                            sx={{
                                borderRadius: '12px',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '& .MuiAccordionSummary-content': {
                                    margin: '16px 0',
                                },
                                '&.Mui-expanded': {
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0
                                }
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                component="h2" 
                                sx={{ 
                                    fontWeight: 700
                                }}
                            >
                                {formatFieldName(fieldName)} ({fieldValue.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 3 }}>
                            {/* Display as chips for better readability */}
                            {fieldName === 'skills' || fieldName === 'technologies' || fieldName === 'tags' ? (
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
                                    {fieldValue.map((item, index) => (
                                        <Chip 
                                            key={index} 
                                            label={item} 
                                            variant="outlined"
                                            sx={{ 
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                px: 1
                                            }}
                                        />
                                    ))}
                                </Stack>
                            ) : (
                                /* Display as styled list for other arrays */
                                <Stack spacing={1}>
                                    {fieldValue.map((item, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                color: 'white'
                                            }}
                                        >
                                            <Typography 
                                                variant="body1"
                                                sx={{ 
                                                    fontWeight: 500,
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {item}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </AccordionDetails>
                    </Accordion>
                );
            })}

            {/* Footer divider */}
            <Divider sx={{ 
                mt: 4,
                background: 'linear-gradient(90deg, transparent, #667eea, transparent)',
                height: 2,
                border: 'none'
            }} />
        </Paper>
    );
};

export default JobDetails;