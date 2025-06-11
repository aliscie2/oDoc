use crate::models::{Contract, ContractStatus, ContractUpdate};
use crate::contracts::multi_updates;
use crate::establish_connection;
use diesel::prelude::*;
use crate::schema::contracts::dsl::*;

#[test]
fn test_multi_updates_with_changes() {
    let conn = &mut establish_connection();
    
    // Create test contracts
    let contract1 = Contract {
        id: 1,
        title: "Test Contract 1".to_string(),
        status: ContractStatus::Draft,
        created_at: chrono::Utc::now().naive_utc(),
        updated_at: chrono::Utc::now().naive_utc(),
    };
    
    let contract2 = Contract {
        id: 2,
        title: "Test Contract 2".to_string(),
        status: ContractStatus::Draft,
        created_at: chrono::Utc::now().naive_utc(),
        updated_at: chrono::Utc::now().naive_utc(),
    };

    // Insert test contracts
    diesel::insert_into(contracts)
        .values(&[contract1, contract2])
        .execute(conn)
        .expect("Error inserting test contracts");

    // Test updating only changed fields
    let updates = vec![
        ContractUpdate {
            id: 1,
            title: Some("Updated Title 1".to_string()),
            status: None,
        },
        ContractUpdate {
            id: 2,
            title: None,
            status: Some(ContractStatus::Active),
        },
    ];

    let result = multi_updates(conn, updates).expect("Error updating contracts");

    // Verify updates
    let updated_contract1 = contracts.find(1).first::<Contract>(conn).unwrap();
    let updated_contract2 = contracts.find(2).first::<Contract>(conn).unwrap();

    assert_eq!(updated_contract1.title, "Updated Title 1");
    assert_eq!(updated_contract1.status, ContractStatus::Draft);
    assert_eq!(updated_contract2.title, "Test Contract 2");
    assert_eq!(updated_contract2.status, ContractStatus::Active);

    // Cleanup
    diesel::delete(contracts)
        .filter(id.eq_any(vec![1, 2]))
        .execute(conn)
        .expect("Error cleaning up test data");
}

#[test]
fn test_multi_updates_with_no_changes() {
    let conn = &mut establish_connection();
    
    // Create test contract
    let contract = Contract {
        id: 1,
        title: "Test Contract".to_string(),
        status: ContractStatus::Draft,
        created_at: chrono::Utc::now().naive_utc(),
        updated_at: chrono::Utc::now().naive_utc(),
    };

    // Insert test contract
    diesel::insert_into(contracts)
        .values(&contract)
        .execute(conn)
        .expect("Error inserting test contract");

    // Test updating with no changes
    let updates = vec![
        ContractUpdate {
            id: 1,
            title: None,
            status: None,
        },
    ];

    let result = multi_updates(conn, updates).expect("Error updating contracts");

    // Verify no changes
    let updated_contract = contracts.find(1).first::<Contract>(conn).unwrap();
    assert_eq!(updated_contract.title, "Test Contract");
    assert_eq!(updated_contract.status, ContractStatus::Draft);

    // Cleanup
    diesel::delete(contracts)
        .filter(id.eq(1))
        .execute(conn)
        .expect("Error cleaning up test data");
} 