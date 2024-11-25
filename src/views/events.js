document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createEventForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Evita o comportamento padrão do formulário

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const eventDate = document.getElementById('eventDate').value;

        const responseMessage = document.getElementById('responseMessage');
        responseMessage.textContent = ''; // Limpa a mensagem anterior

        // Recupera o token de autenticação do localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            responseMessage.style.color = 'red';
            responseMessage.textContent = 'Usuário não autenticado. Por favor, faça login.';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/addNewEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Inclui o token no cabeçalho
                },
                body: JSON.stringify({
                    title,
                    description,
                    event_date: eventDate, 
                }),
            });

            if (response.ok) {
                responseMessage.style.color = 'green';
                responseMessage.textContent = 'Evento criado com sucesso!';
            } else {
                const error = await response.text();
                responseMessage.textContent = `Erro: ${error}`;
            }
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            responseMessage.textContent = 'Erro ao conectar com o servidor.';
        }
    });
});