import express from "express";
import {Request, Response, Router} from "express";
import { AccountsManager } from "./accounts/accounts";
import { FinancialManager } from "./Financial/financial";

import { access } from "fs";
const port = 3000; 
const server = express();
const routes = Router();

// definir as rotas. 
// a rota tem um verbo/método http (GET, POST, PUT, DELETE)
routes.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido. Rota default nao disponivel. ');
});

// vamos organizar as rotas em outro local 
routes.put('/signUp', AccountsManager.signUpHandler);
routes.post('/getWalletBalance', FinancialManager.getWalletBalanceHandler);
routes.post('/login', AccountsManager.login);
routes.post('/addNewEvent');
routes.post('/getEvents');
routes.post('/deleteEvent');
routes.post('/addFunds'); 
routes.post('/withdrawFunds');
routes.post('/betOnEvent');
routes.post('/finishEvent'); 
routes.post('/searchEvent')






server.use(routes);

server.listen(port, ()=>{
    console.log(`Server is running on: ${port}`);
})