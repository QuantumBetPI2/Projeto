
import {Request, RequestHandler, Response } from "express";

/*Tudo dentro desse modulo, vai tratar 
de finanças na plataforma;
Exemplo: saçdp de carteira de usuário,
transferir dinheiro de uma carteira para outra. */
export namespace FinancialManager {

    const w1: Wallet={
        ownerEmail:"rafa@puc.com.br",
        balance: 0
    }
    const w2: Wallet={
        ownerEmail:"jose@puc.com.br",
        balance: 1000
    }
    
    let WalletDatabase: Wallet[]=[];
    WalletDatabase.push(w1);
    WalletDatabase.push(w2);

    export type Wallet = {
        ownerEmail: string;
        balance: number;
    }
    
    export type Deposit ={
        walletOwnerEmail: string;
        value: number;
    }

    export type internalWhithdraw = {
        walletEmailFrom: string;
        walletEmailTrue: string;
        value: number;
        
    }
    export type externalWhithdraw ={
        walletEmailRequester: string;
        value: number;
    }

    function getWalletBalance(email: string):number|undefined{
        let balance = undefined;
        WalletDatabase.find(w=>{
            if(w.ownerEmail === email){
                balance=w.balance;
                return;
            }
        })
        return balance;
    }   


    export const getWalletBalanceHandler: RequestHandler = (req: Request, res: Response) => {
        // implementar ....
        }
}

/* Ex1. Implementar o tratador da rota de saldo 
   Ex2. Implementar o processo de transferencia de valor de uma conta para outra, verificando se tem saldo
   Ex3. Banco de dados das transferencias internas*/
