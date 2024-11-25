import OracleDB from "oracledb";
import { Request, Response } from "express";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();


interface User {
  id: number;
  completeName: string;
  email: string;
  password: string;
}

// Função para conectar ao banco de dados
async function connectToDatabase() {
    return OracleDB.getConnection({
        user: "sys",
        password: "lucas2006",
        connectString: "localhost:1521/XEPDB1",
        privilege: OracleDB.SYSDBA
    });
}


export const checkDatabaseConnection = async (req: Request, res: Response) => {
  let connection;

  try {
      connection = await connectToDatabase();
      console.log("Banco de dados conectado com sucesso!");
      res.status(200).send("Banco de dados conectado com sucesso!");
  } catch (error) {
      console.error("Erro ao conectar ao banco de dados:", error);
      res.status(500).send("Erro ao conectar ao banco de dados.");
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

// Namespace para gerenciar as contas
export namespace AccountsHandler {
    // Handler para registrar um novo usuário
    export const registerHandler = async (req: Request, res: Response): Promise<void> => {
        const { completeName, email, password } = req.body;

        if (!completeName || !email || !password) {
            res.status(400).send('Requisição inválida - Parâmetros faltando.');
            return;
        }

        let connection;

        try {
            connection = await connectToDatabase();

            // Hash da senha antes de armazená-la
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await connection.execute(
                `INSERT INTO ACCOUNTS (completeName, email, password) VALUES (:completeName, :email, :password)`,
                { completeName, email, password: hashedPassword }, // Use a senha hasheada
                { autoCommit: true }
            );

            console.log("Usuário registrado com sucesso!", result.rowsAffected);
            res.status(201).send('Usuário registrado com sucesso!');
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            res.status(500).send(error instanceof Error ? error.message : "Erro desconhecido.");
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

    
    export const loginHandler = async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;
  
      if (!email || !password) {
          res.status(400).send('Requisição inválida - Parâmetros faltando.');
          return;
      }
  
      let connection;
  
      try {
          connection = await connectToDatabase();
  
          const result = await connection.execute(
              `SELECT * FROM ACCOUNTS WHERE email = :email`,
              { email }
          );
  
          // Verificação se rows existe e não está vazio
          if (result.rows && result.rows.length > 0) {
              const row = result.rows[0] as (number | string)[];
  
              const user: User = {
                  id: row[0] as number,
                  completeName: row[1] as string,
                  email: row[2] as string,
                  password: row[3] as string
              };
  
              // Comparar a senha fornecida com a senha armazenada
              const isPasswordValid = await bcrypt.compare(password, user.password);
  
              if (!isPasswordValid) {
                  console.log("Falha no login: credenciais inválidas.");
                  res.status(401).send('Credenciais inválidas.');
                  return;
              }
  
              // Criação do token
              const token = jwt.sign(
                  { id: user.id, email: user.email }, // Não incluir role
                  process.env.JWT_SECRET!,
                  { expiresIn: '1h' }
              );
  
              console.log("Login bem-sucedido!", user);
  
              // Verificar se é o admin e redirecionar
              if (user.email === 'aDmin@gmail.com') {
                  // Aqui você pode enviar uma resposta que indique que é um admin
                  res.status(200).json({ message: 'Login realizado com sucesso! Você é um Admin.', token });
                  // Redirecionamento específico do lado do cliente deve ser feito no frontend
              } else {
                  res.status(200).json({ message: 'Login realizado com sucesso!', token });
              }
          } else {
              console.log("Falha no login: credenciais inválidas.");
              res.status(401).send('Credenciais inválidas.');
          }
      } catch (error) {
          console.error("Erro ao fazer login:", error);
          res.status(500).send(error instanceof Error ? error.message : "Erro desconhecido.");
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




}