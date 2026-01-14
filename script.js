// ========================================
// SISTEMA DE NAVEGAÇÃO VERTICAL COM SCROLL SUAVE
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Seleciona todos os links de navegação
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    // Adiciona evento de clique em cada link para scroll suave
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove classe 'active' de todos os links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Adiciona classe 'active' ao link clicado
            this.classList.add('active');
            
            // Faz scroll suave até a seção
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Destaca o link ativo baseado na posição do scroll
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ========================================
    // ABA 1: CAMPO CONDICIONAL "OUTROS" - CLASSE PROCESSUAL
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
    // ABA 1: CAMPO CONDICIONAL "OUTROS" - SITUAÇÃO ATUAL
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
    // ABA 1: MÁSCARA PARA VALOR DA CAUSA (R$)
    // ========================================

    const valorCausaInput = document.getElementById('valor-causa');
    
    valorCausaInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        valor = (parseInt(valor) / 100).toFixed(2);
        e.target.value = valor.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    });

    // ========================================
    // ABA 1: SUBMIT DO FORMULÁRIO
    // ========================================

    const formDadosProcesso = document.getElementById('form-dados-processo');
    
    formDadosProcesso.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Coleta os dados do formulário (exemplo)
        const numeroProcesso = document.getElementById('numero-processo').value;
        const comarca = document.getElementById('comarca').value;
        
        // Feedback visual
        alert(`Dados salvos com sucesso!\n\nProcesso: ${numeroProcesso}\nComarca: ${comarca}`);
        
        console.log('Formulário de Dados do Processo enviado');
    });

    // ========================================
    // ABA 2: ADICIONAR NOVO ANDAMENTO
    // ========================================

    const btnAddAndamento = document.getElementById('btn-add-andamento');
    const tableAndamentos = document.getElementById('table-andamentos');

    btnAddAndamento.addEventListener('click', function() {
        // Cria uma nova linha
        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td><input type="date" style="border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
            <td><input type="text" placeholder="Descrição do andamento" style="width: 100%; border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
            <td><button class="btn btn-link">Anexar</button></td>
        `;
        
        tableAndamentos.appendChild(novaLinha);
        
        // Feedback
        console.log('Nova linha de andamento adicionada');
    });

    // ========================================
    // ABA 2: ADICIONAR NOVA PROVIDÊNCIA
    // ========================================

    const btnAddProvidencia = document.getElementById('btn-add-providencia');
    const tableProvidencias = document.getElementById('table-providencias');

    btnAddProvidencia.addEventListener('click', function() {
        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td><input type="text" placeholder="Ação a ser tomada" style="width: 100%; border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
            <td><input type="text" placeholder="Nome do responsável" style="width: 100%; border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
            <td>
                <select class="status-select">
                    <option value="Pendente">Pendente</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluído">Concluído</option>
                </select>
            </td>
        `;
        
        tableProvidencias.appendChild(novaLinha);
        console.log('Nova providência adicionada');
    });

    // ========================================
    // ABA 3: ADICIONAR HONORÁRIO CONTRATUAL
    // ========================================

    const btnAddHonorarioContratual = document.getElementById('btn-add-honorario-contratual');
    const tableHonorariosContratuais = document.getElementById('table-honorarios-contratuais');

    btnAddHonorarioContratual.addEventListener('click', function() {
        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td><input type="date" style="border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
            <td><input type="text" placeholder="Descrição" style="width: 100%; border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
            <td><input type="text" placeholder="R$ 0,00" style="width: 100%; border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
        `;
        
        tableHonorariosContratuais.appendChild(novaLinha);
        console.log('Novo honorário contratual adicionado');
    });

    // ========================================
    // ABA 3: ADICIONAR HONORÁRIO SUCUMBENCIAL
    // ========================================

    const btnAddHonorarioSucumbencial = document.getElementById('btn-add-honorario-sucumbencial');
    const tableHonorariosSucumbenciais = document.getElementById('table-honorarios-sucumbenciais');

    btnAddHonorarioSucumbencial.addEventListener('click', function() {
        // Remove a linha vazia inicial se existir
        const primeiraLinha = tableHonorariosSucumbenciais.querySelector('tr');
        if (primeiraLinha && primeiraLinha.textContent.trim() === '---') {
            tableHonorariosSucumbenciais.innerHTML = '';
        }

        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td><input type="date" style="border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
            <td><input type="text" placeholder="Fonte (ex: Sentença)" style="width: 100%; border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
            <td><input type="text" placeholder="R$ 0,00" style="width: 100%; border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
        `;
        
        tableHonorariosSucumbenciais.appendChild(novaLinha);
        console.log('Novo honorário sucumbencial adicionado');
    });

    // ========================================
    // ABA 3: ADICIONAR PREVISÃO DE RECEBIMENTO
    // ========================================

    const btnAddPrevisao = document.getElementById('btn-add-previsao');
    const tablePrevisoes = document.getElementById('table-previsoes');

    btnAddPrevisao.addEventListener('click', function() {
        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td><input type="date" style="border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
            <td>
                <select style="border: 1px solid #d1d5db; padding: 6px; border-radius: 6px; width: 100%;">
                    <option value="Contratual">Contratual</option>
                    <option value="Sucumbencial">Sucumbencial</option>
                </select>
            </td>
            <td><input type="text" placeholder="Descrição" style="width: 100%; border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
            <td><input type="text" placeholder="R$ 0,00" style="width: 100%; border: 1px solid #d1d5db; padding: 6px; border-radius: 6px;"></td>
        `;
        
        tablePrevisoes.appendChild(novaLinha);
        console.log('Nova previsão de recebimento adicionada');
    });

    // ========================================
    // ABA 3: EXIBIR CAMPOS DE INTERVALO PERSONALIZADO
    // ========================================

    const radiosRelatorio = document.querySelectorAll('input[name="periodo-relatorio"]');
    const intervaloPersonalizado = document.getElementById('intervalo-personalizado');

    radiosRelatorio.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'personalizado') {
                intervaloPersonalizado.style.display = 'grid';
            } else {
                intervaloPersonalizado.style.display = 'none';
            }
        });
    });

    // ========================================
    // FEEDBACK VISUAL NOS BOTÕES DE RELATÓRIO
    // ========================================

    const btnsRelatorio = document.querySelectorAll('.button-group .btn-outline');
    
    btnsRelatorio.forEach(btn => {
        btn.addEventListener('click', function() {
            const acao = this.textContent.trim();
            alert(`Função "${acao}" será implementada no backend.`);
            console.log(`Botão clicado: ${acao}`);
        });
    });

    // ========================================
    // ANIMAÇÃO DE HOVER NOS BOTÕES DE LINKS
    // ========================================

    const btnsVerPDF = document.querySelectorAll('.btn-link');
    
    btnsVerPDF.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Funcionalidade de visualização de PDF (apenas front-end)');
        });
    });

    // ========================================
    // LOG DE INICIALIZAÇÃO
    // ========================================

    console.log('Sistema de Controle de Processos Judiciais inicializado');
    console.log('Funcionalidades ativas:');
    console.log('   - Sistema de abas');
    console.log('   - Campos condicionais');
    console.log('   - Adição dinâmica de linhas em tabelas');
    console.log('   - Máscaras de formatação');
    console.log('   - Feedback visual de interações');
});
