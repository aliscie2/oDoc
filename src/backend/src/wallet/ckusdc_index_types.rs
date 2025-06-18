// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::api::call::CallResult as Result;

#[derive(CandidType, Deserialize)]
pub struct UpgradeArg {
    pub ledger_id: Option<Principal>,
    pub retrieve_blocks_from_ledger_interval_seconds: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct InitArg {
    pub ledger_id: Principal,
    pub retrieve_blocks_from_ledger_interval_seconds: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub enum IndexArg {
    Upgrade(UpgradeArg),
    Init(InitArg),
}

pub type BlockIndex = candid::Nat;
pub type SubAccount = serde_bytes::ByteBuf;
#[derive(CandidType, Deserialize)]
pub struct IndexAccount {
    pub owner: Principal,
    pub subaccount: Option<SubAccount>,
}

#[derive(CandidType, Deserialize)]
pub struct GetAccountTransactionsArgs {
    pub max_results: candid::Nat,
    pub start: Option<BlockIndex>,
    pub account: IndexAccount,
}

pub type Tokens = candid::Nat;
#[derive(CandidType, Deserialize)]
pub struct Burn {
    pub from: IndexAccount,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<u64>,
    pub amount: candid::Nat,
    pub spender: Option<IndexAccount>,
}

#[derive(CandidType, Deserialize)]
pub struct Mint {
    pub to: IndexAccount,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<u64>,
    pub amount: candid::Nat,
}

#[derive(CandidType, Deserialize)]
pub struct Approve {
    pub fee: Option<candid::Nat>,
    pub from: IndexAccount,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<u64>,
    pub amount: candid::Nat,
    pub expected_allowance: Option<candid::Nat>,
    pub expires_at: Option<u64>,
    pub spender: IndexAccount,
}

#[derive(CandidType, Deserialize)]
pub struct Transfer {
    pub to: IndexAccount,
    pub fee: Option<candid::Nat>,
    pub from: IndexAccount,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<u64>,
    pub amount: candid::Nat,
    pub spender: Option<IndexAccount>,
}

#[derive(CandidType, Deserialize)]
pub struct Transaction {
    pub burn: Option<Burn>,
    pub kind: String,
    pub mint: Option<Mint>,
    pub approve: Option<Approve>,
    pub timestamp: u64,
    pub transfer: Option<Transfer>,
}

#[derive(CandidType, Deserialize)]
pub struct TransactionWithId {
    pub id: BlockIndex,
    pub transaction: Transaction,
}

#[derive(CandidType, Deserialize)]
pub struct GetTransactions {
    pub balance: Tokens,
    pub transactions: Vec<TransactionWithId>,
    pub oldest_tx_id: Option<BlockIndex>,
}

#[derive(CandidType, Deserialize)]
pub struct GetTransactionsErr {
    pub message: String,
}

#[derive(CandidType, Deserialize)]
pub enum GetTransactionsResult {
    Ok(GetTransactions),
    Err(GetTransactionsErr),
}

#[derive(CandidType, Deserialize)]
pub struct GetBlocksRequest {
    pub start: candid::Nat,
    pub length: candid::Nat,
}

pub type Map = Vec<(String, Box<Value>)>;
#[derive(CandidType, Deserialize)]
pub enum Value {
    Int(candid::Int),
    Map(Map),
    Nat(candid::Nat),
    Nat64(u64),
    Blob(serde_bytes::ByteBuf),
    Text(String),
    Array(Vec<Box<Value>>),
}

pub type Block = Box<Value>;
#[derive(CandidType, Deserialize)]
pub struct GetBlocksResponse {
    pub blocks: Vec<Block>,
    pub chain_length: u64,
}

#[derive(CandidType, Deserialize)]
pub struct FeeCollectorRanges<IndexAccount> {
    pub ranges: Vec<(IndexAccount, Vec<(BlockIndex, BlockIndex)>)>,
}

#[derive(CandidType, Deserialize)]
pub struct ListSubaccountsArgs {
    pub owner: Principal,
    pub start: Option<SubAccount>,
}

#[derive(CandidType, Deserialize)]
pub struct Status {
    pub num_blocks_synced: BlockIndex,
}

pub struct Service(pub Principal);
impl Service {
    pub async fn get_account_transactions(
        &self,
        arg0: GetAccountTransactionsArgs,
    ) -> Result<(GetTransactionsResult,)> {
        ic_cdk::call(self.0, "get_account_transactions", (arg0,)).await
    }
    pub async fn get_blocks(&self, arg0: GetBlocksRequest) -> Result<(GetBlocksResponse,)> {
        ic_cdk::call(self.0, "get_blocks", (arg0,)).await
    }
    pub async fn get_fee_collectors_ranges(&self) -> Result<(FeeCollectorRanges<IndexAccount>,)> {
        ic_cdk::call(self.0, "get_fee_collectors_ranges", ()).await
    }
    pub async fn icrc_1_balance_of(&self, arg0: IndexAccount) -> Result<(Tokens,)> {
        ic_cdk::call(self.0, "icrc1_balance_of", (arg0,)).await
    }
    pub async fn ledger_id(&self) -> Result<(Principal,)> {
        ic_cdk::call(self.0, "ledger_id", ()).await
    }
    pub async fn list_subaccounts(&self, arg0: ListSubaccountsArgs) -> Result<(Vec<SubAccount>,)> {
        ic_cdk::call(self.0, "list_subaccounts", (arg0,)).await
    }
    pub async fn status(&self) -> Result<(Status,)> {
        ic_cdk::call(self.0, "status", ()).await
    }
}
