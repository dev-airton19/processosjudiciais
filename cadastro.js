// ========================================
// SISTEMA DE CADASTRO DE NOVO PROCESSO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // BOTÃO VOLTAR PARA LISTAGEM
    // ========================================
    
    const btnVoltarListagem = document.getElementById('btn-voltar-listagem-cadastro');
    if (btnVoltarListagem) {
        btnVoltarListagem.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }

    // ========================================
    // CAMPO CONDICIONAL "OUTROS" - CLASSE PROCESSUAL
    // ========================================

    const classeProcessualSelect = document.getElementById('classe-processual');
    const outrosClasseRow = document.getElementById('outros-classe-row');

    classeProcessualSelect.addEventListener('change', function() {
        if (this.value === 'Outros') {
            outrosClasseRow.style.display = 'block';
        } else {
            outrosClasseRow.style.display = 'none';
        }
    });

    // ========================================
    // CAMPO CONDICIONAL "OUTROS" - SITUAÇÃO ATUAL
    // ========================================

    const situacaoAtualSelect = document.getElementById('situacao-atual');
    const outrosSituacaoRow = document.getElementById('outros-situacao-row');

    situacaoAtualSelect.addEventListener('change', function() {
        if (this.value === 'Outros') {
            outrosSituacaoRow.style.display = 'block';
        } else {
            outrosSituacaoRow.style.display = 'none';
        }
    });

    // ========================================
    // MÁSCARA PARA VALOR DA CAUSA (R$)
    // ========================================

    const valorCausaInput = document.getElementById('valor-causa');
    
    valorCausaInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        valor = (parseInt(valor) / 100).toFixed(2);
        e.target.value = valor.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    });

    // ========================================
    // SUBMIT DO FORMULÁRIO DE CADASTRO
    // ========================================

    const formCadastroProcesso = document.getElementById('form-cadastro-processo');
    
    formCadastroProcesso.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Criar novo processo
        const novoProcesso = {
            id: Date.now(),
            numeroProcesso: document.getElementById('numero-processo').value,
            comarca: document.getElementById('comarca').value,
            orgao: document.getElementById('orgao').value,
            classeProcessual: document.getElementById('classe-processual').value,
            naturezaJuridica: document.getElementById('natureza-juridica').value,
            valorCausa: document.getElementById('valor-causa').value,
            autor: document.getElementById('autor').value,
            reu: document.getElementById('reu').value,
            advogado: document.getElementById('advogado').value,
            dataAjuizamento: document.getElementById('data-ajuizamento').value,
            situacaoAtual: document.getElementById('situacao-atual').value
        };

        // Carregar processos existentes
        let processos = JSON.parse(localStorage.getItem('processos')) || [];
        
        // Adicionar novo processo
        processos.push(novoProcesso);
        
        // Salvar no localStorage
        localStorage.setItem('processos', JSON.stringify(processos));
        
        // Feedback visual
        alert(`Processo cadastrado com sucesso!\n\nNúmero: ${novoProcesso.numeroProcesso}\nAutor: ${novoProcesso.autor}`);
        
        console.log('Novo processo cadastrado:', novoProcesso);
        console.log('Total de processos:', processos.length);
        
        // Redirecionar para listagem
        window.location.href = 'dashboard.html';
    });

    // ========================================
    // LOG DE INICIALIZAÇÃO
    // ========================================

    console.log('Sistema de cadastro de processo inicializado');
});
