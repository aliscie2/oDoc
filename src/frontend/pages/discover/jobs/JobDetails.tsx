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
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface JobDetailsProps {
    job: Job;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job }) => {
    const [expandedSection, setExpandedSection] = React.useState<string | false>('basic');

    // Helper function to format field names
    const formatFieldName = (key: string) => {
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    };

    // Get basic info fields (non-array fields)
    const basicInfoFields = Object.keys(job)
        .filter(key => !Array.isArray(job[key as keyof Job]) && 
                key !== 'category' && 
                job[key as keyof Job] !== undefined);

    // Get array fields
    const arrayFields = Object.keys(job).filter(key => {
        const value = job[key as keyof Job];
        return Array.isArray(value) && 
               key !== 'matches' && 
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
                maxWidth: 800, 
                mx: 'auto',
                lineHeight: 1.8,
                fontFamily: 'Georgia, serif'
            }}
        >
            {/* Job Title */}
            {job.job_titles && (
                <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                        mb: 3, 
                        fontWeight: 'bold',
                        textAlign: 'center',
                        borderBottom: 2,
                        borderColor: 'divider',
                        pb: 2
                    }}
                >
                    {job.job_titles[0]}
                </Typography>
            )}

            {/* Basic Information Accordion */}
            <Accordion 
                expanded={expandedSection === 'basic'} 
                onChange={handleAccordionChange('basic')}
                sx={{
                    mb: 2,
                    '&:before': {
                        display: 'none',
                    },
                    borderRadius: '8px !important'
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon color="primary" />}
                    sx={{
                        borderLeft: 4,
                        borderColor: 'primary.main',
                        '& .MuiAccordionSummary-content': {
                            margin: '12px 0',
                        }
                    }}
                >
                    <Typography 
                        variant="h5" 
                        component="h2" 
                        sx={{ 
                            fontWeight: 'bold',
                            pl: 2
                        }}
                    >
                        Job Overview
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ pl: 2 }}>
                        {basicInfoFields.map((key) => {
                            const value = job[key as keyof Job];
                            if (!value) return null;
                            
                            return (
                                <Typography 
                                    key={key} 
                                    variant="body1" 
                                    sx={{ 
                                        mb: 1.5,
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    <strong>{formatFieldName(key)}:</strong> {String(value)}
                                </Typography>
                            );
                        })}
                    </Box>
                </AccordionDetails>
            </Accordion>

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
                            '&:before': {
                                display: 'none',
                            },
                            borderRadius: '8px !important'
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon color="primary" />}
                            sx={{
                                borderLeft: 4,
                                borderColor: 'primary.main',
                                '& .MuiAccordionSummary-content': {
                                    margin: '12px 0',
                                }
                            }}
                        >
                            <Typography 
                                variant="h5" 
                                component="h2" 
                                sx={{ 
                                    fontWeight: 'bold',
                                    pl: 2
                                }}
                            >
                                {formatFieldName(fieldName)}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {/* Display as chips for better readability */}
                            {fieldName === 'skills' || fieldName === 'technologies' || fieldName === 'tags' ? (
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, pl: 2 }}>
                                    {fieldValue.map((item, index) => (
                                        <Chip 
                                            key={index} 
                                            label={item} 
                                            variant="outlined"
                                            sx={{ 
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    ))}
                                </Stack>
                            ) : (
                                /* Display as bulleted list for other arrays */
                                <Box component="ul" sx={{ pl: 4, mt: 1 }}>
                                    {fieldValue.map((item, index) => (
                                        <Typography 
                                            key={index} 
                                            component="li" 
                                            variant="body1"
                                            sx={{ 
                                                mb: 1,
                                                fontSize: '1.1rem',
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {item}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                );
            })}

            {/* Footer divider */}
            <Divider sx={{ mt: 4 }} />
        </Paper>
    );
};

export default JobDetails;

