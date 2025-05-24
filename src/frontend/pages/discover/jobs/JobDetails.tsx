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
    // Generate basic info tree data dynamically for all non-array fields
    const basicInfoTreeData = Object.keys(job)
        .filter(key => !Array.isArray(job[key as keyof Job]) && 
                key !== 'category' && // Skip category field
                job[key as keyof Job] !== undefined)
        .map(key => ({
            id: key,
            label: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}: ${job[key as keyof Job]}`
        }));

    // Generate tree data for array fields dynamically
    const generateArrayTreeData = (fieldName: string) => {
        const fieldValue = job[fieldName as keyof Job];
        if (!fieldValue || !Array.isArray(fieldValue) || fieldValue.length === 0) {
            return [];
        }
        
        return fieldValue.map((item, index) => ({
            id: `${fieldName}-${index}`,
            label: item
        }));
    };

    // Get all array fields from job object
    const arrayFields = Object.keys(job).filter(key => {
        const value = job[key as keyof Job];
        return Array.isArray(value) && 
               key !== 'matches' && // Exclude matches from display
               value.length > 0;
    });

    // Generate section data for all array fields
    const sectionData = arrayFields.map(field => ({
        id: field,
        label: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' '),
        children: generateArrayTreeData(field)
    }));

    // Combine basic info with array sections
    const allTreeData = [
        { id: 'basic', label: 'Basic Information', children: basicInfoTreeData },
        ...sectionData
    ].filter(section => section.children.length > 0);

    return (
        <Box sx={{ p: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ minHeight: 400, minWidth: 350 }}>
                <RichTreeView
                    items={allTreeData}
                    slots={{ item: CustomTreeItem }}
                    defaultExpandedItems={['basic', ...arrayFields]}
                />
            </Box>
        </Box>
    );
};

export default JobDetails;

