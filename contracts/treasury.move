// Simplified Treasury for Hackathon Demo
module agent::treasury {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;

    // === Errors ===
    const EInsufficientFunds: u64 = 0;
    const ENotAuthorized: u64 = 1;

    // === Structs ===
    
    public struct Treasury has key {
        id: UID,
        balance: Balance<SUI>,
        owner: address,
        total_earned: u64,
        total_spent: u64,
    }

    public struct TreasuryCap has key, store {
        id: UID,
    }

    // === Events ===
    
    public struct TreasuryCreated has copy, drop {
        treasury_id: address,
        owner: address,
    }

    public struct ProfitRecorded has copy, drop {
        treasury_id: address,
        amount: u64,
    }

    public struct ExpensePaid has copy, drop {
        treasury_id: address,
        amount: u64,
        description: vector<u8>,
    }

    // === Initialization ===

    public entry fun create_treasury(ctx: &mut TxContext) {
        let owner = tx_context::sender(ctx);
        
        let treasury = Treasury {
            id: object::new(ctx),
            balance: balance::zero(),
            owner,
            total_earned: 0,
            total_spent: 0,
        };

        let cap = TreasuryCap {
            id: object::new(ctx),
        };

        event::emit(TreasuryCreated {
            treasury_id: object::uid_to_address(&treasury.id),
            owner,
        });

        transfer::transfer(cap, owner);
        transfer::share_object(treasury);
    }

    // === Public Functions ===

    public entry fun deposit(
        treasury: &mut Treasury,
        coin: Coin<SUI>,
        _ctx: &mut TxContext
    ) {
        let amount = coin::value(&coin);
        balance::join(&mut treasury.balance, coin::into_balance(coin));
        treasury.total_earned = treasury.total_earned + amount;

        event::emit(ProfitRecorded {
            treasury_id: object::uid_to_address(&treasury.id),
            amount,
        });
    }

    public entry fun withdraw_for_expense(
        treasury: &mut Treasury,
        _cap: &TreasuryCap,
        amount: u64,
        description: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(balance::value(&treasury.balance) >= amount, EInsufficientFunds);

        let coin = coin::take(&mut treasury.balance, amount, ctx);
        treasury.total_spent = treasury.total_spent + amount;

        event::emit(ExpensePaid {
            treasury_id: object::uid_to_address(&treasury.id),
            amount,
            description,
        });

        transfer::public_transfer(coin, tx_context::sender(ctx));
    }

    // === View Functions ===

    public fun get_balance(treasury: &Treasury): u64 {
        balance::value(&treasury.balance)
    }

    public fun get_owner(treasury: &Treasury): address {
        treasury.owner
    }

    public fun get_stats(treasury: &Treasury): (u64, u64) {
        (treasury.total_earned, treasury.total_spent)
    }
}
