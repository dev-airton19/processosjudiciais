// ========================================
// SISTEMA DE AUTENTICAÇÃO - LOGIN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const formularioLogin = document.getElementById('login-form');
    const usuarioInput = document.getElementById('usuario');
    const senhaInput = document.getElementById('senha');
    const botaoLogin = document.getElementById('login-btn');
    const mensagemErro = document.getElementById('error-message');
    const mensagemSucesso = document.getElementById('success-message');

    // Credenciais de demonstração
    const usuariosValidos = {
        'admin': '123456',
        'usuario': 'senha123'
    };

    // Mostrar mensagem de erro
    function mostrarErro(mensagem) {
        mensagemErro.textContent = mensagem;
        mensagemErro.classList.add('show');
        mensagemSucesso.classList.remove('show');
        
        // Remove o erro automaticamente após 5 segundos
        setTimeout(() => {
            mensagemErro.classList.remove('show');
        }, 5000);
    }

    // Mostrar mensagem de sucesso
    function mostrarSucesso(mensagem) {
        mensagemSucesso.textContent = mensagem;
        mensagemSucesso.classList.add('show');
        mensagemErro.classList.remove('show');
    }

    // Função principal de login
    window.fazerLogin = function(event) {
        event.preventDefault(); // Impede o recarregamento da página

        const usuario = usuarioInput.value.trim();
        const senha = senhaInput.value;

        // Validações básicas
        if (!usuario) {
            mostrarErro('⚠️ Por favor, digite seu usuário.');
            usuarioInput.focus();
            return;
        }

        if (!senha) {
            mostrarErro('⚠️ Por favor, digite sua senha.');
            senhaInput.focus();
            return;
        }

        // Feedback visual no botão
        const textoOriginal = botaoLogin.textContent;
        botaoLogin.disabled = true;
        botaoLogin.textContent = 'Autenticando...';

        // Simula tempo de processamento
        setTimeout(() => {
            // Verifica credenciais
            if (usuariosValidos[usuario] === senha) {
                // SUCESSO
                mostrarSucesso('✓ Login autorizado! Acessando painel...');
                
                // Salva sessão no navegador
                localStorage.setItem('usuarioLogado', usuario);

                // Redireciona para o Dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // FALHA
                botaoLogin.disabled = false;
                botaoLogin.textContent = textoOriginal;

                if (!usuariosValidos[usuario]) {
                    mostrarErro('❌ Usuário não encontrado.');
                } else {
                    mostrarErro('❌ Senha incorreta.');
                }

                senhaInput.value = '';
                senhaInput.focus();
            }
        }, 800);
    };

    // Limpar mensagens ao digitar
    usuarioInput.addEventListener('input', () => mensagemErro.classList.remove('show'));
    senhaInput.addEventListener('input', () => mensagemErro.classList.remove('show'));

    // Se já estiver logado, manda direto para o dashboard
    if (localStorage.getItem('usuarioLogado')) {
        // window.location.href = 'dashboard.html'; // Comentei para você poder testar a tela de login
    }
    
    console.log('Sistema de Login pronto.');
});