#![no_std]

//! Alert Registry — on-chain whale-alert subscriptions for the Stellar DEX/Soroban.
//!
//! Two-sided by design:
//!   * users WRITE subscriptions (`subscribe`) — real user-facing on-chain state,
//!   * the off-chain pipeline READS the registry (`list_active`) to know what to watch,
//!   * the pipeline WRITES an attestation (`record_trigger`) when an alert fires —
//!     each trigger is a public, timestamped transaction against this contract id,
//!     which is the artifact that proves the product actually invokes the chain.

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, Symbol, Vec,
};

/// Ledgers of persistence bump applied on every read/write of stored entries.
/// ~17280 ledgers/day at ~5s close time; 30 days keeps entries alive well past
/// any review window without unbounded cost.
const BUMP_AMOUNT: u32 = 518_400; // ~30 days
const BUMP_THRESHOLD: u32 = 60_480; // ~3.5 days — extend when TTL drops below this

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum AssetKey {
    Native,
    /// (asset_code, issuer) — asset codes are NOT unique across issuers, so the
    /// issuer address is part of the identity.
    Issued(Symbol, Address),
}

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub struct Subscription {
    pub id: u64,
    pub owner: Address,
    pub asset: AssetKey,
    /// Minimum amount in stroops (7-decimal fixed point) that qualifies as a whale.
    pub min_amount: i128,
    pub active: bool,
    pub created_ledger: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    SubCount,
    TriggerCount,
    Sub(u64),
    OwnerSubs(Address),
}

#[contract]
pub struct AlertRegistry;

#[contractimpl]
impl AlertRegistry {
    /// One-time initialization. Sets the admin (the pipeline's attestation signer)
    /// and zeroes the counters. Panics if already initialized.
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::SubCount, &0u64);
        env.storage().instance().set(&DataKey::TriggerCount, &0u64);
    }

    /// Register a whale-alert subscription. Requires the owner's authorization,
    /// so a subscription can only be created by its own account. Returns the new id.
    pub fn subscribe(env: Env, owner: Address, asset: AssetKey, min_amount: i128) -> u64 {
        owner.require_auth();
        if min_amount <= 0 {
            panic!("min_amount must be positive");
        }

        let id = Self::next_id(&env, &DataKey::SubCount);
        let sub = Subscription {
            id,
            owner: owner.clone(),
            asset,
            min_amount,
            active: true,
            created_ledger: env.ledger().sequence(),
        };

        let sub_key = DataKey::Sub(id);
        env.storage().persistent().set(&sub_key, &sub);
        Self::bump(&env, &sub_key);

        let owner_key = DataKey::OwnerSubs(owner);
        let mut ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or_else(|| Vec::new(&env));
        ids.push_back(id);
        env.storage().persistent().set(&owner_key, &ids);
        Self::bump(&env, &owner_key);

        env.events()
            .publish((symbol_short!("subscribe"), id), sub.min_amount);
        id
    }

    /// Deactivate a subscription. Only the owner may deactivate it.
    pub fn deactivate(env: Env, owner: Address, id: u64) {
        owner.require_auth();
        let sub_key = DataKey::Sub(id);
        let mut sub: Subscription = env
            .storage()
            .persistent()
            .get(&sub_key)
            .unwrap_or_else(|| panic!("subscription not found"));
        if sub.owner != owner {
            panic!("not subscription owner");
        }
        sub.active = false;
        env.storage().persistent().set(&sub_key, &sub);
        Self::bump(&env, &sub_key);
        env.events()
            .publish((symbol_short!("deactvate"), id), ());
    }

    /// Read a single subscription (used by the pipeline and the dashboard).
    pub fn get_subscription(env: Env, id: u64) -> Option<Subscription> {
        let sub_key = DataKey::Sub(id);
        let sub: Option<Subscription> = env.storage().persistent().get(&sub_key);
        if sub.is_some() {
            Self::bump(&env, &sub_key);
        }
        sub
    }

    /// Page through active subscriptions. `start` is a subscription id (1-based);
    /// `limit` caps the number returned. The pipeline calls this (via simulation)
    /// to learn what to watch — the read is load-bearing, not decorative.
    pub fn list_active(env: Env, start: u64, limit: u32) -> Vec<Subscription> {
        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::SubCount)
            .unwrap_or(0);
        let mut out = Vec::new(&env);
        let mut id = if start == 0 { 1 } else { start };
        let mut taken: u32 = 0;
        while id <= count && taken < limit {
            if let Some(sub) = env
                .storage()
                .persistent()
                .get::<DataKey, Subscription>(&DataKey::Sub(id))
            {
                if sub.active {
                    out.push_back(sub);
                    taken += 1;
                }
            }
            id += 1;
        }
        out
    }

    /// Attest that an alert fired. Admin-only — this is the pipeline's on-chain
    /// write and the public proof of the closed loop. Emits an event carrying the
    /// originating Stellar tx hash so the trigger is independently queryable.
    /// Returns the new cumulative trigger count.
    pub fn record_trigger(env: Env, sub_id: u64, tx_hash: BytesN<32>, amount: i128) -> u64 {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("not initialized"));
        admin.require_auth();

        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TriggerCount)
            .unwrap_or(0)
            + 1;
        env.storage()
            .instance()
            .set(&DataKey::TriggerCount, &count);

        env.events().publish(
            (symbol_short!("trigger"), sub_id),
            (tx_hash, amount, count),
        );
        count
    }

    pub fn trigger_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TriggerCount)
            .unwrap_or(0)
    }

    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("not initialized"))
    }

    fn next_id(env: &Env, key: &DataKey) -> u64 {
        let next: u64 = env.storage().instance().get(key).unwrap_or(0) + 1;
        env.storage().instance().set(key, &next);
        next
    }

    fn bump(env: &Env, key: &DataKey) {
        env.storage()
            .persistent()
            .extend_ttl(key, BUMP_THRESHOLD, BUMP_AMOUNT);
    }
}

mod test;
