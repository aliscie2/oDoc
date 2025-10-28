import { CPayment, CustomContract } from "$/declarations/backend/backend.did";
import { randomString } from "@/DataProcessing/dataSamples";
import CustomContractViewer from "@/components/customContractView";
import { Promise as PromiseType } from "@/components/customContractView/types/contract";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import { parseContractUrlParams } from "@/utils/urlEncoder";
import { Principal } from "@dfinity/principal";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotificationActions } from "@/hooks/useNotificationActions";

const useContractFetch = (
  contractId: string | undefined,
  owner: string | undefined,
  contracts: RootState["filesState"]["contracts"],
  dispatch: ReturnType<typeof useDispatch>,
) => {
  const [loading, setLoading] = useState(false);
  const [loadedContract, setLoadedContract] = useState<CustomContract | null>(
    null,
  );

  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId || !owner || !backendActor) return;

      // Check if contract already exists in Redux
      if (contracts[contractId]) {
        return;
      }

      // Check if we already loaded this contract
      if (loadedContract?.id === contractId) {
        return;
      }
      setLoading(true);

      try {
        const result = await backendActor.get_contract(owner, contractId);
        if ("Ok" in result && "CustomContract" in result.Ok) {
          const contract = result.Ok.CustomContract;
          // Update Redux store
          dispatch({ type: "SET_CONTRACT", contract });
          setLoadedContract(contract);
        } else {
          setLoadedContract(null);
        }
      } catch (error) {
        console.error("Error loading contract:", error);
        setLoadedContract(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId, owner, contracts, dispatch, loadedContract]);

  return {
    contract: (contractId && contracts[contractId]) || loadedContract,
    loading,
  };
};

const createNewPromise = (
  sender: Principal,
  contract_id: string,
): CPayment => ({
  contract_id,
  id: "fresh_promise_" + randomString(),
  date_created: Date.now() * 1e6,
  date_released: 0,
  sender,
  status: { None: null },
  amount: 0,
  receiver: Principal.anonymous(),
  cells: [],
});

interface ContractComponentProps {
  contractId: string;
  owner?: string;
}

export function ContractComponent({
  contractId,
  owner,
}: ContractComponentProps) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { contracts, profile, wallet } = useSelector((state: RootState) => state.filesState);
  const { notifications } = useSelector((state: RootState) => state.notificationState);
  const { isDarkMode } = useSelector((state: RootState) => state.uiState);

  const { contract: fetchedContract, loading } = useContractFetch(
    contractId,
    owner,
    contracts,
    dispatch,
  );

  const currentContract = useMemo(() => {
    // Redux now always stores unwrapped CustomContract
    if (!fetchedContract) {
      // Return defaults for loading state
      return {
        promises: [],
        payments: [],
        contracts: [],
        permissions: [],
        formulas: [],
        name: "Loading...",
        id: contractId,
        creator: "",
        date_created: 0,
        date_updated: 0,
      } as CustomContract;
    }

    // Merge promises and payments
    const allPromises = [
      ...fetchedContract.promises,
      ...fetchedContract.payments,
    ];
    const uniquePromises = Array.from(
      new Map(allPromises.map((p) => [p.id, p])).values(),
    );

    return { ...fetchedContract, promises: uniquePromises, payments: [] };
  }, [fetchedContract, contractId]);

  const filteredContract = useMemo(() => {
    // Filter for non-creators
    const isCreator =
      !profile ||
      !currentContract.creator ||
      profile.id === currentContract.creator;
    
    if (isCreator) {
      return currentContract;
    }

    const filteredPromises = currentContract.promises.filter(
      (p) => p.receiver.toString() === profile.id
    );

    return { ...currentContract, promises: filteredPromises };
  }, [currentContract, profile]);

  const handleAddPromise = useCallback(() => {
    if (!profile) return;
    dispatch({
      type: "ADD_PROMISE",
      contract_id: contractId,
      promise: createNewPromise(Principal.fromText(profile.id), contractId),
      insertIndex: currentContract.promises?.length || 0,
    });
  }, [dispatch, contractId, profile, currentContract.promises]);

  const handleDeletePromise = useCallback(
    (promiseId: string) => {
      dispatch({ type: "DELETE_PROMISE", contract_id: contractId, id: promiseId });
    },
    [dispatch, contractId],
  );

  const handleUpdatePromise = useCallback(
    (promiseId: string, updates: Partial<PromiseType>) => {
      if (updates.receiver && typeof updates.receiver === "string") {
        try {
          updates.receiver = Principal.fromText(updates.receiver) as unknown as string;
        } catch (error) {
          console.error("Invalid receiver principal:", updates.receiver, error);
          alert(`Invalid user ID: ${updates.receiver}. Please select a valid user.`);
          return;
        }
      }

      const currentPromise = currentContract.promises.find((p: CPayment) => p.id === promiseId);
      if (!currentPromise) return;

      dispatch({
        type: "UPDATE_PROMISE",
        contract_id: contractId,
        promise: { ...currentPromise, ...updates },
      });
    },
    [dispatch, contractId, currentContract.promises],
  );

  const handleContractNameChange = useCallback(
    (name: string) => {
      dispatch({ type: "RENAME_SMART_CONTRACT", contract_id: contractId, new_name: name });
    },
    [dispatch, contractId],
  );

  const { markAsRead } = useNotificationActions();

  const handleMarkNotificationSeen = useCallback(
    async (notificationId: string) => {
      await markAsRead(notificationId);
    },
    [markAsRead],
  );

  const handleDeleteContract = useCallback(async () => {
    try {
      const response = await backendActor.delete_custom_contract(contractId);
      if ("Err" in response && !response.Err.includes("Not found")) {
        alert(response.Err);
        return;
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      throw error;
    }

    dispatch({ type: "REMOVE_CONTRACT", id: contractId });
    if (location.pathname.includes("/contract")) navigate("/contracts");
  }, [contractId, dispatch, navigate, location.pathname]);

  const centerStyle = { display: "flex", justifyContent: "center", alignItems: "center" };
  
  if (!profile) return null;
  if (loading) return <div style={{ ...centerStyle, height: "200px", fontSize: "1.2rem" }}>Loading contract...</div>;
  if (!currentContract.creator) {
    return (
      <Box sx={{ ...centerStyle, minHeight: "400px", p: 2 }}>
        <Card sx={{ maxWidth: 500, width: "100%", boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <DeleteOutlineIcon sx={{ fontSize: 56, color: "error.main" }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Contract not found</Typography>
                <Typography variant="body2" color="text.secondary">
                  This contract may have been deleted or does not exist
                </Typography>
              </Box>
            </Box>
            <Chip label="Contract deleted" size="small" color="error" sx={{ height: 24, fontSize: "0.75rem" }} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentContract.name || "Untitled contract"}</title>
        <link rel="icon" type="image/png" href="/agreement.png" />
      </Helmet>
      <CustomContractViewer
        contract={filteredContract}
        currentUserId={profile.id}
        currentUserName={profile.name}
        currentBalance={wallet.balance - wallet.total_debt}
        notifications={notifications}
        isDarkMode={isDarkMode}
        onAddPromise={handleAddPromise}
        onDeletePromise={handleDeletePromise}
        onUpdatePromise={handleUpdatePromise}
        onContractNameChange={handleContractNameChange}
        onDeleteContract={handleDeleteContract}
        onMarkNotificationSeen={handleMarkNotificationSeen}
      />
    </>
  );
}

function ContractPage() {
  const location = useLocation();
  const contractParams = useMemo(() => parseContractUrlParams(), [location.pathname, location.search]);

  if (!contractParams?.id) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", fontSize: "1.2rem", color: "red" }}>
        No contract ID provided
      </div>
    );
  }

  return <ContractComponent contractId={contractParams.id} owner={contractParams.owner} />;
}

export default ContractPage;
