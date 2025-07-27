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