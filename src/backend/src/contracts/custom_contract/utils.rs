use crate::websocket::{NoteContent, Notification, PaymentAction};
use crate::CPayment;
use ic_cdk::caller;

pub fn notify_about_promise(payment: CPayment, action_type: PaymentAction) {
    notify_about_promise_with_old_payment(payment, action_type, None);
}

pub fn notify_about_promise_with_old_payment(
    payment: CPayment,
    action_type: PaymentAction,
    old_payment: Option<CPayment>,
) {
    let mut receiver = payment.receiver;
    if receiver == caller() {
        receiver = payment.sender;
    }

    // Update caller's notification if it exists
    if let Some(mut old_note) = Notification::get(caller().to_text(), payment.id.clone()) {
        old_note.content = NoteContent::CPaymentContract(payment.clone(), action_type.clone());
        old_note.save();
    }

    // Handle receiver's notification
    if let Some(mut existing_note) =
        Notification::get(receiver.to_text().clone(), payment.id.clone())
    {
        if let NoteContent::CPaymentContract(stored_payment, _) = existing_note.content.clone() {
            // If we have an old payment to compare against, use it; otherwise use stored payment
            let comparison_payment = old_payment.as_ref().unwrap_or(&stored_payment);

            // Check if any relevant fields have actually changed
            let has_changes = payment.amount != comparison_payment.amount
                || payment.sender != comparison_payment.sender
                || payment.receiver != comparison_payment.receiver
                || payment.status != comparison_payment.status
                || payment.cells != comparison_payment.cells;

            // Only update notification and mark as unseen if there are actual changes
            if has_changes {
                existing_note.is_seen = false;
                existing_note.content =
                    NoteContent::CPaymentContract(payment.clone(), action_type.clone());
                existing_note.time = ic_cdk::api::time() as f64;
                existing_note.save();
            } else {
                // Update content but keep is_seen status unchanged if no meaningful changes
                existing_note.content =
                    NoteContent::CPaymentContract(payment.clone(), action_type.clone());
                existing_note.time = ic_cdk::api::time() as f64;
                existing_note.save();
            }
        }
    } else {
        // Create new notification only if one doesn't exist
        let content = NoteContent::CPaymentContract(payment.clone(), action_type);
        let new_notification = Notification {
            id: payment.id.clone(),
            sender: caller(),
            receiver,
            content,
            is_seen: false,
            time: ic_cdk::api::time() as f64,
        };
        new_notification.save();
    }
}
