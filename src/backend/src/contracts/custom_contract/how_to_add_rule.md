```rs
ValidationRule {
    name: "minimum_amount",
    validator: |payment, _| {
        if payment.amount < 1.0 {
            Err("Minimum payment amount is 1.0".to_string())
        } else {
            Ok(())
        }
    },
    actions: &["create", "update"],
},
```


```rs
CContractValidationRule {
    name: "table_name_not_empty",
    validator: |_contract, table, _old| {
        if table.name.trim().is_empty() {
            Err("Table name cannot be empty".to_string())
        } else {
            Ok(())
        }
    },
    actions: &["create_table", "update_table"],
},
```