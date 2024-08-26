const usuarioLabel = document.querySelector('label[for="usuario"]');
const usuarioInput = document.querySelector('input[id="username"]');

const passwordLabel = document.querySelector('label[for="password"]');
const passwordInput = document.querySelector('input[id="password"]');

const submitButton = document.querySelector('button[type="submit"]');
const loginButton = document.querySelector(".login-bar")
const cadastroButton = document.querySelector(".cadastro-bar")

// Alterar o texto do label de usuário
usuarioLabel.textContent = 'Digite seu usuário ou e-mail:';

// Adicionar um placeholder ao input de usuário
usuarioInput.placeholder = 'Ex: joao.silva@example.com';

// Alterar o tipo de input de senha para texto
passwordInput.type = 'text';

// Adicionar um evento de clique ao botão de submit


if(usuarioInput == "Lucas" && passwordInput == 12345){
    loginButton.style.display = "block";
    cadastroButton.style.display = "block";
  }
