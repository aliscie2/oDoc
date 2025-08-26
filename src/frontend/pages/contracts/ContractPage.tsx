import CustomContractViewer from "@/components/customContractView";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { backendActor, ckUSDCActor, logout } from "@/utils/backendUtils";
import { parseContractUrlParams } from "@/utils/urlEncoder";

function ContractPage() {
  console.log("rendering times");
  // Parse URL parameters - support new short format, encoded format, and legacy formats
  const contractParams = parseContractUrlParams();
  const contractId = contractParams?.id;
  const owner = contractParams?.owner;

  const { contracts, profile } = useSelector((state: any) => state.filesState);
  // Using direct backendActor import
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentContract = contractId ? contracts[contractId] : null;

  useEffect(() => {
    (async () => {
      // If contract already exists in local state, don't fetch from backend
      if (currentContract) {
        return;
      }

      // If only contractId is provided without owner, skip backend call
      // This assumes the contract should already be in local state
      if (contractId && !owner) {
        return;
      }

      // Only fetch if we have the required parameters (both owner and contractId)
      if (!owner || !contractId || !backendActor) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const contract = await backendActor.get_contract(owner, contractId);

        if (contract && "Ok" in contract) {
          const fetchedContract = contract.Ok.CustomContract;
          console.log({ result: fetchedContract });
          // Only update state without saving to backend - contract already exists
          dispatch({ type: "SET_CONTRACT", contract: fetchedContract });
        } else if (contract && "Err" in contract) {
          setError(contract.Err);
        } else {
          setError("Failed to fetch contract");
        }
      } catch (err) {
        setError("Network error while fetching contract");
        console.error("Contract fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [contractId, currentContract, owner]);

  if (!profile) {
    return null;
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          fontSize: "1.2rem",
        }}
      >
        Loading contract...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          fontSize: "1.2rem",
          color: "red",
        }}
      >
        Error loading contract: {error}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentContract?.name || "Untitled contract"}</title>
        <link rel="icon" type="image/png" href={"/agreement.png"} />
      </Helmet>
      <CustomContractViewer contractId={contractId || ""} />
    </>
  );
}
export default ContractPage;
