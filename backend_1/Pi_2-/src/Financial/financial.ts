import { Request, Response } from "express";
import OracleDB from "oracledb"; // Certifique-se de que você tem o módulo oracledb instalado

async function connectToDatabase() {
    return OracleDB.getConnection({
        user: "sys",
        password: "lucas2006",
        connectString: "localhost:1521/XEPDB1",
        privilege: OracleDB.SYSDBA
    });
}

export namespace FinancialManager {
    export const addFunds = async (req: Request, res: Response): Promise<void> => {
        const { user_id, amount } = req.body;

        // Validação dos parâmetros
        if (!user_id|| !amount) {
            res.status(400).json({ message: 'userId e amount são obrigatórios.' });
            return;
        }

        let connection;

        try {
            connection = await connectToDatabase();

            // Insere os fundos na tabela FUNDS
            const result = await connection.execute(
                `INSERT INTO FUNDS (user_id, amount) VALUES (:user_id, :amount)`,
                { user_id, amount },
                { autoCommit: true }
            );

            console.log("Fundos adicionados com sucesso!", result.rowsAffected);
            res.status(201).json({ message: 'Fundos adicionados com sucesso!' });
        } catch (error) {
            console.error("Erro ao adicionar fundos:", error);
            res.status(500).json({ message: 'Erro ao adicionar fundos.' });
        } finally {
            // Certifique-se de fechar a conexão se estiver aberta
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Erro ao fechar a conexão:', closeError);
                }
            }
        }
    };

    interface FundsResult {
        TOTALFUNDS: number | null; // O valor pode ser nulo se não houver fundos
    }

    
   
    export const withdrawFunds = async (req: Request, res: Response): Promise<void> => {
        const { user_id, amount, account_number } = req.body; // account_number é a conta corrente para a qual o valor será transferido
    
        // Verificar se user_id, amount e account_number estão presentes
        if (!user_id || !amount || amount <= 0 || !account_number) {
            res.status(400).json({ message: 'user_id, amount e account_number são obrigatórios e amount deve ser maior que 0.' });
            return;
        }
    
        let connection;
    
        try {
            connection = await connectToDatabase();
    
            console.log(`Tentando sacar fundos. user_id: ${user_id}, amount: ${amount}, account_number: ${account_number}`);
    
            // Verificar o saldo total do usuário
            const fundsResult = await connection.execute<{ TOTALFUNDS: number }>(
                `SELECT SUM(amount) FROM FUNDS WHERE user_id = :user_id`,
                [user_id]
            );
    
            console.log('Resultado da consulta de fundos:', fundsResult);
    
            // Verifique se fundsResult e rows estão definidos
            if (!fundsResult || !fundsResult.rows || fundsResult.rows.length === 0) {
                res.status(404).json({ message: 'Usuário não encontrado ou sem fundos.' });
                return;
            }
    
            const totalFunds = fundsResult.rows[0] || 0; // Obter o saldo total ou 0 se não houver
    
            console.log('TOTALFUNDS encontrado:', totalFunds);
    
            // Verifique se o saldo é suficiente
            if (totalFunds < amount) {
                res.status(400).json({ message: 'Saldo insuficiente para a retirada.' });
                return;
            }
    
            // Inserir um registro de retirada com valor negativo
            await connection.execute(
                `UPDATE FUNDS SET amount = amount - :amount WHERE user_id = :user_id`,
                {
                    amount,
                    user_id
                },
                { autoCommit: true }
            );
           
            console.log(`Transferindo ${amount} para a conta ${account_number}.`);
    
            res.json({ message: 'Retirada realizada com sucesso!' });
        } catch (error) {
            console.error('Erro ao tentar sacar fundos:', error);
            res.status(500).json({ message: 'Erro ao processar a retirada de fundos.' });
        } finally {

            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Erro ao fechar a conexão:', closeError);
                }
            }
        }
    };
    
}