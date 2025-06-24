import { useDispatch, useSelector } from "react-redux";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import CustomContractComponent from "../../components/ContractTable";
import { custom_contract } from "../../DataProcessing/dataSamples";
import { CustomContract } from "../../../declarations/backend/backend.did";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "../../redux/reducers";
import NotificationPromises from "../../components/ContractTable/notificationPromises";
import { Typography } from "@mui/material";
import React from "react";

function ContractsHistory(props: any) {
  const dispatch = useDispatch();
  const { contracts, profile, all_friends } = useSelector(
    (state: any) => state.filesState,
  );

  const handleClick = () => {
    try {
      if (!profile) {
        throw new Error("Profile is not defined");
      }

      const newContract = {
        ...custom_contract,
        id: uuidv4(),
        creator: profile.id,
        date_created: Date.now() * 1e6,
      };
      dispatch({ type: "ADD_CONTRACT", contract: newContract });
    } catch (error) {
      console.error("Error creating new contract:", error);
      //we can display error for user with snack bar here
    }
  };
  if (!profile) {
    return <div>please login to see this page</div>;
  }

  return (
    <Box>
      <Button onClick={handleClick} variant="contained" color="primary">
        Create New Contract
      </Button>
      <Divider />
      <List dense>
        <ListItem>
          <NotificationPromises />
        </ListItem>

        <Typography
          variant="h6"
          sx={{
            // color: theme.palette.text.primary,
            fontWeight: "large",
          }}
        >
          List of all your contracts.
        </Typography>
        {Object.values(contracts).map((contract: CustomContract | any) => {
          if (contract) {
            return (
              <ListItem key={contract.id}>
                <Paper
                  elevation={3}
                  sx={{
                    width: "100%",
                    "&:hover": {
                      boxShadow: 6,
                    },
                  }}
                >
                  <CustomContractComponent
                    profile={profile}
                    all_friends={all_friends}
                    contractId={contract.id}
                  />
                </Paper>
              </ListItem>
            );
          }
        })}
      </List>
    </Box>
  );
}

export default ContractsHistory;
