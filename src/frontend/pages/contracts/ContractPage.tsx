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

const useContractFetch = (
  contractId: string | undefined,
  owner: string | undefined,
  contracts: unknown,
  dispatch: unknown,
) => {
  const [loading, setLoading] = useState(false);
  const [loadedContract, setLoadedContract] = useState<CustomContract | null>(
    null,
  );

  useEffect(() => {
    const fetchContract = async () => {
      if (
        !contractId ||
        !owner ||
        !backendActor ||
        contracts[contractId] ||
        loadedContract?.id === contractId
      )
        return;

      console.log(
        `🔄 Loading contract from backend: ${contractId} (owner: ${owner})`,
      );
      setLoading(true);

      try {
        const result = await backendActor.get_contract(owner, contractId);
        if ("Ok" in result && "CustomContract" in result.Ok) {
          const contract = result.Ok.CustomContract;
          console.log(`✅ Loaded contract: ${contractId}`);
          dispatch({ type: "SET_CONTRACT", contract });
          setLoadedContract(contract);
        } else {
          console.warn(`⚠️ Failed to load contract ${contractId}:`, result);
        }
      } catch (error) {
        console.error(`❌ Error loading contract ${contractId}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId, owner, contracts, dispatch, loadedContract]);

  return { contract: contracts[contractId] || loadedContract, loading };
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
  const { contracts, profile, wallet } = useSelector(
    (state: RootState) => state.filesState,
  );
  const { notifications } = useSelector(
    (state: RootState) => state.notificationState,
  );
  const { isDarkMode } = useSelector((state: RootState) => state.uiState);

  const { contract: fetchedContract, loading } = useContractFetch(
    contractId,
    owner,
    contracts,
    dispatch,
  );

  const currentContract = useMemo(() => {
    const contract = fetchedContract || {
      promises: [],
      payments: [],
      contracts: [],
      name: "Loading...",
      id: contractId,
      permissions: [],
      creator: "",
      date_created: 0,
      date_updated: 0,
      formulas: [],
    };
    return {
      ...contract,
      promises: contract.promises || [],
      payments: contract.payments || [],
      contracts: contract.contracts || [],
      name: contract.name || "Untitled Contract",
      id: contract.id || contractId,
      permissions: contract.permissions || [],
      formulas: contract.formulas || [],
    } as CustomContract;
  }, [fetchedContract, contractId]);

  const filteredContract = useMemo(() => {
    // Merge payments into promises for UI display
    // Backend stores released promises in contract.payments
    // UI expects all promises (including released) in contract.promises
    const allPromises = [
      ...(currentContract.promises || []),
      ...(currentContract.payments || []),
    ];
    
    // Deduplicate by ID - keep first occurrence
    const seenIds = new Set<string>();
    const mergedPromises = allPromises.filter((p) => {
      if (seenIds.has(p.id)) return false;
      seenIds.add(p.id);
      return true;
    });

    // For contract creator - show all
    if (!profile || !currentContract.creator || profile.id === currentContract.creator) {
      return {
        ...currentContract,
        promises: mergedPromises,
        payments: [], // Clear to avoid confusion
      };
    }

    // For non-creator - filter by receiver
    return {
      ...currentContract,
      promises: mergedPromises.filter(
        (p: CPayment) => p.receiver.toString() === profile.id,
      ),
      payments: [], // Clear to avoid confusion
    };
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
      dispatch({
        type: "DELETE_PROMISE",
        contract_id: contractId,
        id: promiseId,
      });
    },
    [dispatch, contractId],
  );

  const handleUpdatePromise = useCallback(
    (promiseId: string, updates: Partial<PromiseType>) => {
      const processedUpdates = { ...updates };
      if (updates.receiver && typeof updates.receiver === "string") {
        try {
          processedUpdates.receiver = Principal.fromText(
            updates.receiver,
          ) as unknown as string;
        } catch (error) {
          console.error("Invalid receiver principal:", updates.receiver, error);
          alert(
            `Invalid user ID: ${updates.receiver}. Please select a valid user.`,
          );
          return;
        }
      }

      const currentPromise = currentContract.promises.find(
        (p: CPayment) => p.id === promiseId,
      );
      if (!currentPromise) return;

      dispatch({
        type: "UPDATE_PROMISE",
        contract_id: contractId,
        promise: { ...currentPromise, ...processedUpdates },
      });
    },
    [dispatch, contractId, currentContract.promises],
  );

  const handleContractNameChange = useCallback(
    (name: string) => {
      dispatch({
        type: "RENAME_SMART_CONTRACT",
        contract_id: contractId,
        new_name: name,
      });
    },
    [dispatch, contractId],
  );

  const handleMarkNotificationSeen = useCallback(
    async (notificationId: string) => {
      await backendActor?.see_notifications([notificationId]);
      dispatch({ type: "NOTIFICATION_SEEN", id: notificationId });
    },
    [dispatch],
  );

  const handleDeleteContract = useCallback(async () => {
    try {
      const response = await backendActor.delete_custom_contract(contractId);

      if ("Ok" in response) {
        // Dispatch Redux action to remove contract from store
      } else if (response?.Err.includes("Not found")) { /* empty */ } else {
        // snack bar
        alert(response.Err);
        return;
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      throw error;
    }
    dispatch({ type: "REMOVE_CONTRACT", id: contractId });
    if (location.pathname.includes("/contract")) {
      navigate("/contracts");
    }
  }, [contractId, dispatch, navigate]);

  if (!profile) return null;
  if (loading)
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
  if (!currentContract.creator) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 500, width: "100%", boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <DeleteOutlineIcon sx={{ fontSize: 56, color: "error.main" }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Contract not found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This contract may have been deleted or does not exist
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
              <Chip
                label="Contract deleted"
                size="small"
                color="error"
                sx={{ height: 24, fontSize: "0.75rem" }}
              />
            </Box>
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
  const contractParams = useMemo(
    () => parseContractUrlParams(),
    [location.pathname, location.search],
  );

  if (!contractParams?.id) {
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
        No contract ID provided
      </div>
    );
  }

  return (
    <ContractComponent
      contractId={contractParams.id}
      owner={contractParams.owner}
    />
  );
}

export default ContractPage;
