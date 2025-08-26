import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import {
  CustomContract,
  StoredContract,
} from "../../../declarations/backend/backend.did";
import { backendActor, ckUSDCActor, logout } from "../../utils/backendUtils";

import CustomContractComponent from "./index";
import { Typography } from "@mui/material";

export default function SlateCustomContract(props: any) {
  // Using direct backendActor import
  const { id } = props.element;

  const { contracts, profile, all_friends, current_file } = useSelector(
    (state: any) => state.filesState,
  );
  const dispatch = useDispatch();
  const [contract, setContract] = useState<CustomContract>(contracts[id]);
  const [loading, setLoading] = useState(false);
  const is_share = window.location.href.includes("share");

  useEffect(() => {
    (async () => {
      if (!contract && is_share) {
        setLoading(true);
        const contract: undefined | { Ok: StoredContract } | { Err: string } =
          backendActor &&
          current_file &&
          (await backendActor.get_contract(current_file.author, id));
        setLoading(false);
        if (contract && "Ok" in contract) {
          setContract(contract.Ok.CustomContract);
          dispatch({ type: "UPDATE_CONTRACT", contract: contract.Ok });
        }
      } else {
        setContract(contracts[props.id]);
      }
    })();
  }, [contracts]);

  if (loading) {
    return <Typography contentEditable={false}>Loading...</Typography>;
  }
  if (!contracts[id]) {
    return (
      <Typography {...props.attributes} contentEditable={true} color={"error"}>
        <span contentEditable={true}>Contract was deleted....</span>
        <span>{props.children}</span>
      </Typography>
    );
  }

  return (
    <div {...props.attributes} contentEditable={true}>
      <span>{props.children}</span>
      <span contentEditable={false}>
        <CustomContractComponent contractId={id} />
      </span>
    </div>
  );
}
