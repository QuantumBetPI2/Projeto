import express from "express";
import { Request, Response, Router } from "express";
import { AccountsHandler } from "./accounts/accounts";
import { FinancialManager } from "./Financial/financial";
import { EventsHandler } from "./Events/events"; // Importar o EventsHandler



const port = 3000;
const app = express();
const routes = Router();

// Middleware para habilitar o parsing de JSON
app.use(express.json());

// Definir as rotas
routes.get('/', (req: Request, res: Response) => {
    res.statusCode = 403;
    res.send('Acesso não permitido. Rota default não disponível.');
});


app.post('/register', AccountsHandler.registerHandler);
app.post('/login', AccountsHandler.loginHandler);
app.post('/addFunds', FinancialManager.addFunds);
app.post('/withdrawFunds', FinancialManager.withdrawFunds);
app.post("/addNewEvent", EventsHandler.addNewEvent);
app.post("/evaluateEvent", EventsHandler.moderateEvent);
app.delete("/deleteEvent", EventsHandler.deleteEvent);
app.get('/searchEvents', EventsHandler.searchEvents);
app.post('/betOnEvent', EventsHandler.betOnEvent);
app.post('/finishEvent', EventsHandler.finishEvent)

app.post("/test", (req, res) => {
    console.log(req.body); // Verifique se o corpo está chegando
    res.send("Recebido!");
});


app.use(routes);

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);
});