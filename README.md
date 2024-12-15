# Pi 2 projeto integrador- TIME 2
Algumas explicações:
Conta do Admin:
-Admin@gmail.com
senha: 123 
username: Admin_pi

TABELAS DO BANCO: 
CREATE TABLE bets (
    id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    event_id NUMBER NOT NULL,
    amount NUMBER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES accounts(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE FUNDS (
    id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL, 
    amount NUMBER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES ACCOUNTS(id)
);

CREATE TABLE ACCOUNTS (
    id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
    completeName VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) NOT NULL UNIQUE,
    password VARCHAR2(100) NOT NULL
);

CREATE TABLE events (
    id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    title VARCHAR2(255) NOT NULL,
    description CLOB,
    event_date DATE NOT NULL,
    status VARCHAR2(50) DEFAULT 'pending', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (creator_id)
    REFERENCES accounts (id);
);    

Algumas partes do nosso código puxam o id do Admin que foi criado especificamente no nosso banco de dados, então se precisar adicionar o admin no banco de dados mude para o id do admin do seu BD, pois para dar evaluate e finish event só sera liberado se voce logar como admin.

como é possivel ver aqui no BD
![image](https://github.com/user-attachments/assets/e6de4bab-d713-4971-ad44-453fa289bce4)

e no código:
![image](https://github.com/user-attachments/assets/bcac5418-1265-4bfe-92de-1f6b4c95f070)


ps: alguns codigos js estão direto no html


Acredito que isso seja o necessario para o funcionamento do PI, todos as rotas estão funcionando perfeitamente e estão integradas com o banco de dados 



