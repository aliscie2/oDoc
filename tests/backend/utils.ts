import { RegisterUser } from "$/declarations/backend/backend.did";
import { Identity } from "@dfinity/agent";
import { createIdentity } from "@dfinity/pic";
import { Principal } from "@dfinity/principal";

export async function registerUser(userName:string) {
    const newUser = createIdentity(userName);
    const params = {
        name: [userName],
        description: ['tst'],
        email: [],
        photo: []
    };
    
    globalThis.testActor.setIdentity(newUser);
    const result = await globalThis.testActor.register("", params);
    
    if (!('Ok' in result)) throw new Error('Registration failed');
    return { user: newUser, result };
}

export async function deposit(user:Identity, amount:number) {
    const minterIdentity = createIdentity('minter');
    
    globalThis.ckusdcActor.setIdentity(minterIdentity);
    const mintResult = await globalThis.ckusdcActor.icrc1_transfer({
        to: { owner: user.getPrincipal(), subaccount: [] },
        fee: [], memo: [], from_subaccount: [], created_at_time: [],
        amount: BigInt(amount)
    });
    
    if (!('Ok' in mintResult)) throw new Error('Mint failed');
    
    globalThis.ckusdcActor.setIdentity(user);
    const approveResult = await globalThis.ckusdcActor.icrc2_approve({
        from_subaccount: [], 
        spender: { owner: Principal.fromText(globalThis.backendCanisterId), subaccount: [] },
        amount: BigInt(amount), expected_allowance: [], expires_at: [], 
        fee: [], memo: [], created_at_time: []
    });
    
    if (!('Ok' in approveResult)) throw new Error('Approve failed');
    
    globalThis.testActor.setIdentity(user);
    const depositResult = await globalThis.testActor.deposit_ckusdt();
    
    if (!('Ok' in depositResult)) throw new Error('Deposit failed');
    return depositResult;
}

