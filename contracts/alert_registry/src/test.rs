#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, BytesN as _},
    Address, BytesN, Env, IntoVal,
};

fn setup() -> (Env, AlertRegistryClient<'static>, Address) {
    let env = Env::default();
    let contract_id = env.register(AlertRegistry, ());
    let client = AlertRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.init(&admin);
    (env, client, admin)
}

#[test]
fn subscribe_and_get_round_trip() {
    let (env, client, _admin) = setup();
    env.mock_all_auths();
    let owner = Address::generate(&env);

    let id = client.subscribe(&owner, &AssetKey::Native, &1_000_000_000i128);
    assert_eq!(id, 1);

    let sub = client.get_subscription(&id).unwrap();
    assert_eq!(sub.owner, owner);
    assert_eq!(sub.asset, AssetKey::Native);
    assert_eq!(sub.min_amount, 1_000_000_000i128);
    assert!(sub.active);
}

#[test]
fn subscribe_requires_owner_auth() {
    let (env, client, _admin) = setup();
    // No mock_all_auths() — the owner has not authorized.
    let owner = Address::generate(&env);
    let res = client.try_subscribe(&owner, &AssetKey::Native, &1_000_000_000i128);
    assert!(res.is_err());
}

#[test]
fn deactivate_by_non_owner_fails() {
    let (env, client, _admin) = setup();
    env.mock_all_auths();
    let owner = Address::generate(&env);
    let attacker = Address::generate(&env);

    let id = client.subscribe(&owner, &AssetKey::Native, &1_000_000_000i128);
    let res = client.try_deactivate(&attacker, &id);
    assert!(res.is_err());

    // Still active after the failed attempt.
    assert!(client.get_subscription(&id).unwrap().active);
}

#[test]
fn record_trigger_by_non_admin_fails() {
    let (env, client, _admin) = setup();
    let outsider = Address::generate(&env);
    let tx_hash = BytesN::<32>::random(&env);

    // Authorize the outsider only — the contract requires the ADMIN specifically.
    env.mock_auths(&[soroban_sdk::testutils::MockAuth {
        address: &outsider,
        invoke: &soroban_sdk::testutils::MockAuthInvoke {
            contract: &client.address,
            fn_name: "record_trigger",
            args: (1u64, tx_hash.clone(), 5_000_000_000i128).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    let res = client.try_record_trigger(&1u64, &tx_hash, &5_000_000_000i128);
    assert!(res.is_err());
    assert_eq!(client.trigger_count(), 0);
}

#[test]
fn record_trigger_by_admin_increments_count() {
    let (env, client, _admin) = setup();
    env.mock_all_auths();
    let tx_hash = BytesN::<32>::random(&env);

    assert_eq!(client.trigger_count(), 0);
    let c1 = client.record_trigger(&1u64, &tx_hash, &5_000_000_000i128);
    assert_eq!(c1, 1);
    let c2 = client.record_trigger(&1u64, &tx_hash, &9_000_000_000i128);
    assert_eq!(c2, 2);
    assert_eq!(client.trigger_count(), 2);
}

#[test]
fn list_active_paginates_and_excludes_deactivated() {
    let (env, client, _admin) = setup();
    env.mock_all_auths();
    let owner = Address::generate(&env);

    let usdc = symbol_short!("USDC");
    let issuer = Address::generate(&env);
    for _ in 0..5 {
        client.subscribe(
            &owner,
            &AssetKey::Issued(usdc.clone(), issuer.clone()),
            &1_000_000_000i128,
        );
    }
    // Deactivate #3.
    client.deactivate(&owner, &3u64);

    // Page of 2 from the start: ids 1,2 (both active).
    let page = client.list_active(&1u64, &2u32);
    assert_eq!(page.len(), 2);
    assert_eq!(page.get(0).unwrap().id, 1);
    assert_eq!(page.get(1).unwrap().id, 2);

    // From id 3 with a large limit: skips deactivated #3, returns 4 and 5.
    let rest = client.list_active(&3u64, &10u32);
    assert_eq!(rest.len(), 2);
    assert_eq!(rest.get(0).unwrap().id, 4);
    assert_eq!(rest.get(1).unwrap().id, 5);
}

#[test]
fn issued_asset_identity_includes_issuer() {
    let (env, client, _admin) = setup();
    env.mock_all_auths();
    let owner = Address::generate(&env);
    let code = symbol_short!("USDC");
    let issuer_a = Address::generate(&env);
    let issuer_b = Address::generate(&env);

    let a = AssetKey::Issued(code.clone(), issuer_a);
    let b = AssetKey::Issued(code, issuer_b);
    assert_ne!(a, b);

    let id = client.subscribe(&owner, &a, &1_000_000_000i128);
    assert_eq!(client.get_subscription(&id).unwrap().asset, a);
}

#[test]
#[should_panic(expected = "already initialized")]
fn double_init_panics() {
    let (_env, client, admin) = setup();
    client.init(&admin);
}
