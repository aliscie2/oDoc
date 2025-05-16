import * as React from 'react';
import { Job } from '$/declarations/backend/backend.did';
import { Box, Typography, Divider } from '@mui/material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem, TreeItemProps } from '@mui/x-tree-view/TreeItem';

interface JobDetailsProps {
    job: Job;
}

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: TreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  return (
    <TreeItem
      {...props}
      ref={ref}
      slotProps={{
        label: {
          id: `${props.itemId}-label`,
        },
      }}
    />
  );
});

const JobDetails: React.FC<JobDetailsProps> = ({ job }) => {
    const basicInfoTreeData = [
        { id: 'id', label: `ID: ${job.id}` },
        { id: 'description', label: `Description: ${job.description}` },
        { id: 'proficiency', label: `Proficiency Level: ${job.proficiency_level}` },
        { id: 'score', label: `Required Match Score: ${job.required_match_score}` }
    ];

    const jobTitlesTreeData = job.job_titles?.map((title, index) => ({
        id: `title-${index}`,
        label: title
    })) || [];

    const skillsTreeData = job.skills?.map((skill, index) => ({
        id: `skill-${index}`,
        label: skill
    })) || [];

    const educationTreeData = job.education?.map((edu, index) => ({
        id: `edu-${index}`,
        label: edu
    })) || [];

    const certificationsTreeData = job.certifications?.map((cert, index) => ({
        id: `cert-${index}`,
        label: cert
    })) || [];

    const experienceTreeData = job.experience?.map((exp, index) => ({
        id: `exp-${index}`,
        label: exp
    })) || [];

    const linksTreeData = job.links?.map((link, index) => ({
        id: `link-${index}`,
        label: link
    })) || [];

    const allTreeData = [
        { id: 'basic', label: 'Basic Information', children: basicInfoTreeData },
        { id: 'titles', label: 'Job Titles', children: jobTitlesTreeData },
        { id: 'skills', label: 'Skills', children: skillsTreeData },
        { id: 'education', label: 'Education', children: educationTreeData },
        { id: 'certifications', label: 'Certifications', children: certificationsTreeData },
        { id: 'experience', label: 'Experience', children: experienceTreeData },
        { id: 'links', label: 'Links', children: linksTreeData }
    ].filter(section => section.children.length > 0);

    return (
        <Box sx={{ p: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ minHeight: 400, minWidth: 350 }}>
                <RichTreeView
                    items={allTreeData}
                    slots={{ item: CustomTreeItem }}
                    defaultExpandedItems={['basic', 'titles', 'skills', 'education', 'certifications', 'experience', 'links']}
                />
            </Box>
        </Box>
    );
};

export default JobDetails;

