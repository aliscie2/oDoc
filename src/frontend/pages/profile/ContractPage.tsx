import CustomContractComponent from "../../components/ContractTable";
import React from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";

function ContractPage() {
  const contractId = window.location.search.split("id=")[1];
  const { contracts, profile, all_friends } = useSelector(
    (state: any) => state.filesState,
  );
  if (!profile) {
    return;
  }
  const dispatch = useDispatch();
  const currentContract = contracts[contractId];
  return (
    <>
      <Helmet>
        <title>{currentContract?.name || "Untitled contract"}</title>
        <link rel="icon" type="image/png" href={"/agreement.png"} />
      </Helmet>
      <CustomContractComponent
        profile={profile}
        all_friends={all_friends}
        contractId={contractId}
      />
    </>
  );
}
export default ContractPage;
