import OracleDB from "oracledb";
import { Request, Response } from "express";
import dotenv from 'dotenv';
import { Connection } from 'oracledb';
import { stringify } from 'flatted';
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';




dotenv.config();

// Função para conectar ao banco de dados
async function connectToDatabase() {
    return OracleDB.getConnection({
        user: "sys",
        password: "lucas2006",
        connectString: "localhost:1521/XEPDB1",
        privilege: OracleDB.SYSDBA
    });
}

// Namespace para gerenciar eventos
export namespace EventsHandler {
  
    // Handler para adicionar um novo evento
    export const addNewEvent = async (req: Request, res: Response): Promise<void> => {
        const { title, description, event_date } = req.body;
    
        // Validação dos parâmetros
        if (!title || !event_date) {
            res.status(400).send('Requisição inválida - Título e data do evento são obrigatórios.');
            return;
        }
    
        let connection;
    
        try {
            connection = await connectToDatabase();
    
            const result = await connection.execute(
                `INSERT INTO events (title, description, event_date, status) VALUES (:title, :description, :event_date, 'pending')`,
                {
                    title,
                    description: description || null, // Permitir que a descrição seja nula
                    event_date: new Date(event_date) // Garantir que a data seja um objeto Date
                },
                { autoCommit: true }
            );
    
            console.log("Evento adicionado com sucesso!", result.rowsAffected);
            res.status(201).send('Evento adicionado com sucesso!');
        } catch (error) {
            console.error("Erro ao adicionar evento:", error);
            if (error instanceof Error) {
                res.status(500).send(error.message);
            } else {
                res.status(500).send("Erro desconhecido.");
            }
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Erro ao fechar a conexão:", err);
                }
            }
        }
    };
    
   
    export const moderateEvent = async (req: Request, res: Response): Promise<void> => {
        const token = req.headers['authorization']?.split(' ')[1]; // Supondo o formato Bearer {token}
    
        if (!token) {
            res.status(401).send("Token não fornecido.");
            return;
        }
    
        try {
            // Decodifica o token para obter o ID do usuário
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
            const userId = decoded.id;
    
            const { eventId, action, reason } = req.body;
    
            if (!eventId || !action) {
                res.status(400).send("Requisição inválida - Parâmetros faltando.");
                return;
            }
    
            let connection;
    
            try {
                connection = await connectToDatabase();
    
                // Determina o status com base na ação recebida
                let status: string;
                if (action === "approved") {
                    status = "approved";
                } else if (action === "rejected") {
                    status = "rejected";
                } else {
                    res.status(400).send("Ação inválida.");
                    return;
                }
    
                // Atualiza o status do evento
                const updateStatusResult = await connection.execute(
                    `UPDATE events SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :eventId`,
                    { status, eventId },
                    { autoCommit: true }
                );
    
                if (updateStatusResult.rowsAffected === 0) {
                    res.status(404).json({ message: "Evento não encontrado." });
                    return;
                }
    
                // Se rejeitado, atualiza a descrição e registra o motivo
                if (status === "rejected" && reason) {
                    await connection.execute(
                        `UPDATE events SET description = :reason WHERE id = :eventId`,
                        { reason, eventId },
                        { autoCommit: true }
                    );
                }
    
                res.status(200).json({ message: "Evento moderado com sucesso!" });
            } catch (error) {
                res.status(500).json({ message: error instanceof Error ? error.message : "Erro desconhecido." });
            } finally {
                if (connection) {
                    try {
                        await connection.close();
                    } catch (err) {
                        console.error("Erro ao fechar a conexão:", err);
                    }
                }
            }
        } catch (error) {
            res.status(403).send("Token inválido ou expirado.");
        }
    };
    
    interface Event {
        id: number;
        status: string;
       
      }

      export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
        const { eventId, id } = req.body;
        let connection;
    
        // Verificar se eventId e id foram fornecidos
        if (!eventId || !id) {
            console.error('Parâmetros ausentes: eventId ou id não fornecido');
            res.status(400).json({ message: 'eventId e id são obrigatórios.' });
            return; // Aqui está correto, pois precisamos parar a execução se algum parâmetro estiver faltando
        }
    
        try {
            console.log('Iniciando processo de deleção...');
            console.log(`Evento ID: ${eventId}, Moderador ID: ${id}`);
    
            connection = await connectToDatabase();
            console.log('Conectando ao banco de dados...');
    
            // Verificar se o evento existe
            const eventResult = await connection.execute(
                `SELECT * FROM EVENTS WHERE id = :eventId`,
                [eventId]
            );
    
            console.log('Resultado da consulta ao banco de dados:', eventResult);
    
            if (!eventResult || !eventResult.rows || eventResult.rows.length === 0) {
                console.error('Evento não encontrado');
                res.status(404).json({ message: 'Evento não encontrado.' });
                return; // Aqui também é necessário retornar para evitar continuar o processamento
            }
    
            // Verificar se o moderador tem permissão (ID fixo 163)
            if (id !== 163) {
                console.error('Moderador não tem permissão para deletar este evento');
                res.status(403).json({ message: 'Você não tem permissão para deletar este evento.' });
                return;
            }
    
            // Atualizar o status do evento para 'deleted'
            const updateResult = await connection.execute(
                `UPDATE EVENTS SET status = 'deleted' WHERE id = :eventId`,
                [eventId],
                { autoCommit: true } // Assegura que a atualização seja confirmada
            );
    
            console.log('Resultado da atualização no banco de dados:', updateResult);
    
            // Verificar se o evento foi atualizado corretamente
            if (updateResult.rowsAffected === 0) {
                console.error('Erro ao atualizar o evento: Nenhuma linha afetada');
                res.status(500).json({ message: 'Erro ao atualizar o evento.' });
                return;
            }
    
            console.log('Evento deletado com sucesso.');
            res.json({ message: 'Evento deletado com sucesso.' }); // Resposta final
    
        } catch (error) {
            console.error('Erro ao tentar deletar o evento:', error);
            res.status(500).json({ message: 'Erro interno ao tentar deletar o evento. Verifique os logs para mais detalhes.' });
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
    
    

    interface Event {
        id: number;
        title: string;
        description: string;
        event_date: Date; // Assuming event_date is a Date object
        status: string;
        created_at: Date; // Assuming created_at is a Date object
        updated_at: Date; // Assuming updated_at is a Date object
    }
    
    export const searchEvents = async (req: Request, res: Response): Promise<void> => {
        const keyword = req.query.keyword as string; // Palavra-chave de busca vinda da URL
        let connection;
    
        try {
            connection = await connectToDatabase();
    
            // Consulta ao banco de dados com LIKE para busca por título ou descrição
            const result = await connection.execute(
                `SELECT id, title, 
                        DBMS_LOB.SUBSTR(description, 4000, 1) AS description, -- Lê até 4000 caracteres do CLOB
                        event_date, status, created_at, updated_at 
                 FROM events 
                 WHERE LOWER(title) LIKE LOWER(:keyword) 
                 OR LOWER(description) LIKE LOWER(:keyword)`,
                { keyword: `%${keyword}%` }, // Adiciona os '%' manualmente para evitar confusão
                { outFormat: OracleDB.OUT_FORMAT_OBJECT } // Formato objeto para evitar circularidade
            );
    
            // Verifica se existem eventos retornados
            if (!result.rows || result.rows.length === 0) {
                res.status(404).json({ message: "Nenhum evento encontrado." });
                return;
            }
    
            // Mapeamento simples dos eventos retornados
            const events = result.rows.map((row: any) => ({
                id: row.ID,
                title: row.TITLE,
                description: row.DESCRIPTION, // Agora é uma string
                event_date: row.EVENT_DATE,
                status: row.STATUS,
                created_at: row.CREATED_AT,
                updated_at: row.UPDATED_AT
            }));
    
            // Retorna os eventos encontrados
            res.status(200).json(events);
        } catch (error) {
            console.error("Erro ao buscar eventos:", error);
            res.status(500).json({ message: "Erro ao buscar eventos." });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error("Erro ao fechar a conexão:", closeError);
                }
            }
        }
    };

    // Definição de tipos
interface UserResult {
    id: number; // ou string, dependendo da sua configuração
}

interface FundsResult {
    sum: number | null; // Pode ser null se não houver fundos
}

export const betOnEvent = async (req: Request, res: Response): Promise<void> => {
    const { user_id, event_id, amount, statusBet } = req.body;

    console.log("Recebendo dados da requisição:", req.body);

    // Validação dos parâmetros
    if (!user_id || !event_id || !amount || !statusBet) {
        console.error("Parâmetros obrigatórios ausentes:", { user_id, event_id, amount, statusBet });
        res.status(400).json({ message: 'User ID, ID do evento, valor e o status são obrigatórios.' });
        return;
    }

    if (statusBet !== 'yes' && statusBet !== 'no') {
        console.error("Valor inválido para statusBet:", statusBet);
        res.status(400).json({ message: "O status da aposta deve ser 'yes' ou 'no'." });
        return;
    }

    let connection;

    try {
        connection = await connectToDatabase();
        console.log("Conexão com o banco de dados estabelecida.");

        // Verifica o saldo do usuário na tabela FUNDS
        const fundsResult = await connection.execute<{ SUM: number }[]>(
            `SELECT SUM(amount) FROM funds WHERE user_id = :user_id`,
            { user_id }
        );

        console.log("Resultado da consulta ao saldo do usuário:", fundsResult);

        // Verifica se há resultados e se o saldo é válido
        if (!fundsResult.rows || fundsResult.rows.length === 0 || fundsResult.rows[0] === null) {
            console.error("Saldo não encontrado ou inválido para o usuário:", fundsResult.rows);
            res.status(400).json({ message: "Saldo não encontrado para o usuário." });
            return;
        }

        const userBalance = fundsResult.rows[0][0]; // Acessa a propriedade SUM diretamente
        console.log("Saldo do usuário:", userBalance);

        // Verifica se o saldo é suficiente
        if (amount > userBalance) {
            console.error("Saldo insuficiente:", { amount, userBalance });
            res.status(400).json({ message: "Saldo insuficiente para realizar a aposta." });
            return;
        }

        // Insere a aposta na tabela BETS
        const betInsertResult = await connection.execute(
            `INSERT INTO bets (user_id, event_id, amount, statusBet) VALUES (:user_id, :event_id, :amount, :statusBet)`,
            { user_id, event_id, amount, statusBet },
            { autoCommit: true }
        );

        console.log("Aposta inserida com sucesso:", betInsertResult);

        // Deduz o valor da aposta do saldo do usuário
        const updateFundsResult = await connection.execute(
            `UPDATE funds SET amount = amount - :amount WHERE user_id = :user_id`,
            { amount, user_id },
            { autoCommit: true }
        );

        console.log("Saldo atualizado com sucesso:", updateFundsResult);

        res.status(201).json({ message: 'Aposta realizada com sucesso!' });
    } catch (error) {
        console.error("Erro ao realizar aposta:", error);
        res.status(500).json({ message: "Erro ao realizar aposta." });
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("Conexão com o banco de dados fechada.");
            } catch (closeError) {
                console.error("Erro ao fechar a conexão:", closeError);
            }
        }
    }
};





interface Bet {
    user_id: number;
    amount: number;
    statusBet: string; 
}

export const finishEvent = async (req: Request, res: Response): Promise<void> => {
    const { event_id, admin_id, winner } = req.body;

    console.log("Finalizando evento:", { event_id, admin_id, winner });

    if (!event_id || !admin_id || !winner) {
        console.error("Parâmetros obrigatórios ausentes:", { event_id, admin_id, winner });
        res.status(400).json({ message: "ID do evento, ID do admin e resultado são obrigatórios." });
        return;
    }

    if (admin_id !== 163) {
        console.error("Apenas o admin pode finalizar o evento.");
        res.status(403).json({ message: "Acesso negado. Apenas o admin pode finalizar eventos." });
        return;
    }

    if (winner !== 'yes' && winner !== 'no') {
        console.error("Valor inválido para winner:", winner);
        res.status(400).json({ message: "O resultado deve ser 'yes' ou 'no'." });
        return;
    }

    let connection;

    try {
        connection = await connectToDatabase();
        console.log("Conexão com o banco de dados estabelecida.");

        const betsResult = await connection.execute<Bet[]>(`
            SELECT user_id, amount, statusBet FROM bets WHERE event_id = :event_id
        `, { event_id });

        if (!betsResult.rows || !Array.isArray(betsResult.rows) || betsResult.rows.length === 0) {
            console.error("Nenhuma aposta encontrada para este evento.");
            res.status(404).json({ message: "Nenhuma aposta encontrada para este evento." });
            return;
        }

        const bets: Bet[] = betsResult.rows.map((row: any[]) => ({
            user_id: Number(row[0]),
            amount: Number(row[1]),
            statusBet: String(row[2])
        }));

        console.log("Apostas encontradas:", bets);

        const winningBets: Bet[] = bets.filter(bet => bet.statusBet === winner);
        const losingBets: Bet[] = bets.filter(bet => bet.statusBet !== winner);

        const totalAmount = bets.reduce((sum: number, bet: Bet) => sum + bet.amount, 0);
        const totalWinningAmount = winningBets.reduce((sum: number, winnerBet: Bet) => sum + winnerBet.amount, 0);

        if (winningBets.length === 0) {
            console.log("Nenhum vencedor para o evento.");
            res.json({ message: "Evento finalizado, mas não há vencedores." });
            return;
        }

        // Calcula a odd proporcional
        const odds = totalAmount / totalWinningAmount;

        // Distribui os ganhos proporcionalmente
        for (const winner of winningBets) {
            const prize = winner.amount * odds; // Cálculo do prêmio com base na odd proporcional

            await connection.execute(`
                UPDATE funds SET amount = amount + :prize WHERE user_id = :user_id
            `, { prize, user_id: winner.user_id }, { autoCommit: true });

            console.log('Prêmio distribuído para o usuário ${winner.user_id}:, prize');
        }

        await connection.execute(`
            UPDATE events SET status = 'finished' WHERE id = :event_id
        `, { event_id }, { autoCommit: true });

        console.log("Evento finalizado e prêmios distribuídos com sucesso!");
        res.json({ message: "Evento finalizado e prêmios distribuídos com sucesso!" });
    } catch (error) {
        console.error("Erro ao finalizar evento:", error);
        res.status(500).json({ message: "Erro ao finalizar evento." });
    } finally {
        if (connection) {
            await connection.close();
            console.log("Conexão com o banco de dados fechada.");
        }
    }
}

export const getEvents = async (req: Request, res: Response): Promise<void> => {
    let connection;

    try {
        connection = await connectToDatabase();

        // Consulta ao banco de dados para pegar todos os eventos
        const result = await connection.execute(
            `SELECT id, title, 
                    DBMS_LOB.SUBSTR(description, 4000, 1) AS description, -- Lê até 4000 caracteres do CLOB
                    event_date, status, created_at, updated_at 
             FROM events`,
            [],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT } // Formato objeto para evitar circularidade
        );

        // Verifica se existem eventos retornados
        if (!result.rows || result.rows.length === 0) {
            res.status(404).json({ message: "Nenhum evento encontrado." });
            return;
        }

        // Mapeamento simples dos eventos retornados
        const events = result.rows.map((row: any) => ({
            id: row.ID,
            title: row.TITLE,
            description: row.DESCRIPTION, // Agora é uma string
            event_date: row.EVENT_DATE,
            status: row.STATUS,
            created_at: row.CREATED_AT,
            updated_at: row.UPDATED_AT
        }));

        // Retorna os eventos encontrados
        res.status(200).json(events);
    } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        res.status(500).json({ message: "Erro ao buscar eventos." });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error("Erro ao fechar a conexão:", closeError);
            }
        }
    }
};
   
    
}
   
    
