// ========================================
// SISTEMA DE ACOMPANHAMENTO DE PROCESSOS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // VARIÁVEIS GLOBAIS
    // ========================================
    
    let processoAtual = null;
    let andamentos = [];
    let prazos = [];
    
    // ========================================
    // BOTÃO VOLTAR PARA LISTAGEM
    // ========================================
    
    const btnVoltarListagem = document.getElementById('btn-voltar-listagem');
    if (btnVoltarListagem) {
        btnVoltarListagem.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    // ========================================
    // CARREGAR PROCESSO
    // ========================================
    
    function carregarProcesso() {
        const processoEditandoId = localStorage.getItem('processoEditando');
        
        if (!processoEditandoId) {
            alert('Nenhum processo selecionado!');
            window.location.href = 'dashboard.html';
            return;
        }
        
        const processos = JSON.parse(localStorage.getItem('processos')) || [];
        processoAtual = processos.find(p => p.id === parseInt(processoEditandoId));
        
        if (!processoAtual) {
            alert('Processo não encontrado!');
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Carregar dados básicos do processo
        document.getElementById('numero-processo').value = processoAtual.numeroProcesso || '';
        document.getElementById('comarca').value = processoAtual.comarca || '';
        document.getElementById('autor').value = processoAtual.autor || '';
        document.getElementById('reu').value = processoAtual.reu || '';
        document.getElementById('objeto').value = processoAtual.objeto || '';
        document.getElementById('valor-causa').value = processoAtual.valorCausa || '';
        document.getElementById('situacao-atual').value = processoAtual.situacaoAtual || '';
        document.getElementById('data-distribuicao').value = processoAtual.dataDistribuicao || '';
        
        // Carregar andamentos e prazos
        andamentos = processoAtual.acompanhamentos || [];
        prazos = processoAtual.prazos || [];
        
        renderizarAndamentos();
        renderizarPrazos();
        
        console.log('Processo carregado:', processoAtual);
    }
    
    // ========================================
    // SALVAR DADOS DO PROCESSO
    // ========================================
    
    function salvarProcesso() {
        if (!processoAtual) return;
        
        // Atualizar dados básicos
        processoAtual.numeroProcesso = document.getElementById('numero-processo').value;
        processoAtual.comarca = document.getElementById('comarca').value;
        processoAtual.autor = document.getElementById('autor').value;
        processoAtual.reu = document.getElementById('reu').value;
        processoAtual.objeto = document.getElementById('objeto').value;
        processoAtual.valorCausa = document.getElementById('valor-causa').value;
        processoAtual.situacaoAtual = document.getElementById('situacao-atual').value;
        processoAtual.dataDistribuicao = document.getElementById('data-distribuicao').value;
        
        // Atualizar andamentos e prazos
        processoAtual.acompanhamentos = andamentos;
        processoAtual.prazos = prazos;
        
        // Salvar no localStorage
        const processos = JSON.parse(localStorage.getItem('processos')) || [];
        const index = processos.findIndex(p => p.id === processoAtual.id);
        
        if (index !== -1) {
            processos[index] = processoAtual;
            localStorage.setItem('processos', JSON.stringify(processos));
            console.log('Processo salvo com sucesso!');
            return true;
        }
        
        return false;
    }
    
    // ========================================
    // ANDAMENTOS - RENDERIZAÇÃO
    // ========================================
    
    function renderizarAndamentos() {
        const tableAndamentos = document.getElementById('table-andamentos');
        tableAndamentos.innerHTML = '';
        
        if (andamentos.length === 0) {
            tableAndamentos.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #6b7280; padding: 40px;">
                        Nenhum andamento cadastrado
                    </td>
                </tr>
            `;
            return;
        }
        
        andamentos.forEach(andamento => {
            const linha = document.createElement('tr');
            linha.dataset.id = andamento.id;
            linha.innerHTML = `
                <td>${andamento.data}</td>
                <td>${andamento.descricao}</td>
                <td>${andamento.responsavel || '-'}</td>
                <td>
                    <button class="btn-action btn-edit-andamento" data-id="${andamento.id}" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-action btn-delete-andamento" data-id="${andamento.id}" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
            tableAndamentos.appendChild(linha);
        });
        
        adicionarEventosAndamentos();
    }
    
    // ========================================
    // ANDAMENTOS - MODAL E AÇÕES
    // ========================================
    
    const btnAddAndamento = document.getElementById('btn-add-andamento');
    const modalAndamento = document.getElementById('modal-andamento');
    const btnFecharModalAndamento = document.getElementById('modal-close-andamento');
    const btnCancelarAndamento = document.getElementById('btn-cancelar-andamento');
    const btnSalvarAndamento = document.getElementById('btn-salvar-andamento');
    
    let andamentoEditandoId = null;
    
    // Abrir modal para novo andamento
    if (btnAddAndamento) {
        btnAddAndamento.addEventListener('click', function() {
            andamentoEditandoId = null;
            document.getElementById('andamento-data').value = '';
            document.getElementById('andamento-descricao').value = '';
            document.querySelector('#modal-andamento .modal-header h3').textContent = 'Adicionar Novo Andamento';
            modalAndamento.classList.add('active');
        });
    }
    
    // Fechar modal
    if (btnFecharModalAndamento) {
        btnFecharModalAndamento.addEventListener('click', () => {
            modalAndamento.classList.remove('active');
            andamentoEditandoId = null;
        });
    }
    
    if (btnCancelarAndamento) {
        btnCancelarAndamento.addEventListener('click', () => {
            modalAndamento.classList.remove('active');
            andamentoEditandoId = null;
        });
    }
    
    if (modalAndamento) {
        modalAndamento.addEventListener('click', function(e) {
            if (e.target === modalAndamento) {
                modalAndamento.classList.remove('active');
                andamentoEditandoId = null;
            }
        });
    }
    
    // Salvar andamento
    if (btnSalvarAndamento) {
        btnSalvarAndamento.addEventListener('click', function() {
            const data = document.getElementById('andamento-data').value;
            const descricao = document.getElementById('andamento-descricao').value;
            
            if (!data || !descricao) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Formatar data DD/MM/YYYY
            const dataFormatada = data.split('-').reverse().join('/');
            
            if (andamentoEditandoId) {
                // Editar andamento existente
                const andamento = andamentos.find(a => a.id === andamentoEditandoId);
                if (andamento) {
                    andamento.data = dataFormatada;
                    andamento.descricao = descricao;
                }
            } else {
                // Adicionar novo andamento
                const novoAndamento = {
                    id: Date.now(),
                    data: dataFormatada,
                    descricao: descricao,
                    responsavel: 'Usuário'
                };
                andamentos.push(novoAndamento);
            }
            
            // Salvar e renderizar
            salvarProcesso();
            renderizarAndamentos();
            
            // Fechar modal
            modalAndamento.classList.remove('active');
            andamentoEditandoId = null;
            
            alert('Andamento salvo com sucesso!');
        });
    }
    
    // Adicionar eventos aos botões de ação
    function adicionarEventosAndamentos() {
        // Botões de editar
        document.querySelectorAll('.btn-edit-andamento').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                const andamento = andamentos.find(a => a.id === id);
                
                if (andamento) {
                    andamentoEditandoId = id;
                    
                    // Converter DD/MM/YYYY para YYYY-MM-DD
                    const partesData = andamento.data.split('/');
                    const dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
                    
                    document.getElementById('andamento-data').value = dataFormatada;
                    document.getElementById('andamento-descricao').value = andamento.descricao;
                    document.querySelector('#modal-andamento .modal-header h3').textContent = 'Editar Andamento';
                    modalAndamento.classList.add('active');
                }
            });
        });
        
        // Botões de excluir
        document.querySelectorAll('.btn-delete-andamento').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                
                if (confirm('Tem certeza que deseja excluir este andamento?')) {
                    andamentos = andamentos.filter(a => a.id !== id);
                    salvarProcesso();
                    renderizarAndamentos();
                }
            });
        });
    }
    
    // ========================================
    // PRAZOS - RENDERIZAÇÃO
    // ========================================
    
    function calcularDiasRestantes(dataLimite) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const partesData = dataLimite.split('/');
        const dataLimiteObj = new Date(partesData[2], partesData[1] - 1, partesData[0]);
        dataLimiteObj.setHours(0, 0, 0, 0);
        
        const diffTime = dataLimiteObj - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }
    
    function renderizarPrazos() {
        const tablePrazos = document.getElementById('table-prazos');
        tablePrazos.innerHTML = '';
        
        if (prazos.length === 0) {
            tablePrazos.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #6b7280; padding: 40px;">
                        Nenhum prazo cadastrado
                    </td>
                </tr>
            `;
            return;
        }
        
        prazos.forEach(prazo => {
            const diasRestantes = calcularDiasRestantes(prazo.dataLimite);
            let classePrazo = '';
            let textoDias = '';
            
            if (diasRestantes < 0) {
                classePrazo = 'prazo-vencido';
                textoDias = `<span style="color: #ef4444; font-weight: 600;">Vencido há ${Math.abs(diasRestantes)} dias</span>`;
            } else if (diasRestantes === 0) {
                classePrazo = 'prazo-hoje';
                textoDias = '<span style="color: #f59e0b; font-weight: 600;">Hoje!</span>';
            } else if (diasRestantes <= 2) {
                classePrazo = 'prazo-urgente';
                textoDias = `<span style="color: #f59e0b; font-weight: 600;">${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}</span>`;
            } else {
                textoDias = `${diasRestantes} dias`;
            }
            
            const linha = document.createElement('tr');
            linha.dataset.id = prazo.id;
            linha.className = classePrazo;
            linha.innerHTML = `
                <td>${prazo.descricao}</td>
                <td>${prazo.dataLimite}</td>
                <td>${textoDias}</td>
                <td>
                    <button class="btn-action btn-edit-prazo" data-id="${prazo.id}" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-action btn-delete-prazo" data-id="${prazo.id}" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
            tablePrazos.appendChild(linha);
        });
        
        adicionarEventosPrazos();
    }
    
    // ========================================
    // PRAZOS - MODAL E AÇÕES
    // ========================================
    
    const btnAddPrazo = document.getElementById('btn-add-prazo');
    const modalPrazo = document.getElementById('modal-prazo');
    const btnFecharModalPrazo = document.getElementById('modal-close-prazo');
    const btnCancelarPrazo = document.getElementById('btn-cancelar-prazo');
    const btnSalvarPrazo = document.getElementById('btn-salvar-prazo');
    
    let prazoEditandoId = null;
    
    // Abrir modal para novo prazo
    if (btnAddPrazo) {
        btnAddPrazo.addEventListener('click', function() {
            prazoEditandoId = null;
            document.getElementById('prazo-descricao').value = '';
            document.getElementById('prazo-data').value = '';
            document.querySelector('#modal-prazo .modal-header h3').textContent = 'Adicionar Novo Prazo';
            modalPrazo.classList.add('active');
        });
    }
    
    // Fechar modal
    if (btnFecharModalPrazo) {
        btnFecharModalPrazo.addEventListener('click', () => {
            modalPrazo.classList.remove('active');
            prazoEditandoId = null;
        });
    }
    
    if (btnCancelarPrazo) {
        btnCancelarPrazo.addEventListener('click', () => {
            modalPrazo.classList.remove('active');
            prazoEditandoId = null;
        });
    }
    
    if (modalPrazo) {
        modalPrazo.addEventListener('click', function(e) {
            if (e.target === modalPrazo) {
                modalPrazo.classList.remove('active');
                prazoEditandoId = null;
            }
        });
    }
    
    // Salvar prazo
    if (btnSalvarPrazo) {
        btnSalvarPrazo.addEventListener('click', function() {
            const descricao = document.getElementById('prazo-descricao').value;
            const data = document.getElementById('prazo-data').value;
            
            if (!descricao || !data) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Formatar data DD/MM/YYYY
            const dataFormatada = data.split('-').reverse().join('/');
            
            if (prazoEditandoId) {
                // Editar prazo existente
                const prazo = prazos.find(p => p.id === prazoEditandoId);
                if (prazo) {
                    prazo.descricao = descricao;
                    prazo.dataLimite = dataFormatada;
                }
            } else {
                // Adicionar novo prazo
                const novoPrazo = {
                    id: Date.now(),
                    descricao: descricao,
                    dataLimite: dataFormatada
                };
                prazos.push(novoPrazo);
            }
            
            // Salvar e renderizar
            salvarProcesso();
            renderizarPrazos();
            
            // Fechar modal
            modalPrazo.classList.remove('active');
            prazoEditandoId = null;
            
            alert('Prazo salvo com sucesso!');
        });
    }
    
    // Adicionar eventos aos botões de ação
    function adicionarEventosPrazos() {
        // Botões de editar
        document.querySelectorAll('.btn-edit-prazo').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                const prazo = prazos.find(p => p.id === id);
                
                if (prazo) {
                    prazoEditandoId = id;
                    
                    // Converter DD/MM/YYYY para YYYY-MM-DD
                    const partesData = prazo.dataLimite.split('/');
                    const dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
                    
                    document.getElementById('prazo-descricao').value = prazo.descricao;
                    document.getElementById('prazo-data').value = dataFormatada;
                    document.querySelector('#modal-prazo .modal-header h3').textContent = 'Editar Prazo';
                    modalPrazo.classList.add('active');
                }
            });
        });
        
        // Botões de excluir
        document.querySelectorAll('.btn-delete-prazo').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                
                if (confirm('Tem certeza que deseja excluir este prazo?')) {
                    prazos = prazos.filter(p => p.id !== id);
                    salvarProcesso();
                    renderizarPrazos();
                }
            });
        });
    }
    
    // ========================================
    // SALVAR DADOS BÁSICOS DO PROCESSO
    // ========================================
    
    const formDadosProcesso = document.getElementById('form-dados-processo');
    if (formDadosProcesso) {
        formDadosProcesso.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (salvarProcesso()) {
                alert('Dados do processo salvos com sucesso!');
            } else {
                alert('Erro ao salvar dados do processo.');
            }
        });
    }
    
    // Adicionar botão de salvar se não existir
    const btnSalvarDados = document.querySelector('.form-actions .btn-primary');
    if (btnSalvarDados) {
        btnSalvarDados.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (salvarProcesso()) {
                alert('Dados do processo salvos com sucesso!');
            } else {
                alert('Erro ao salvar dados do processo.');
            }
        });
    }
    
    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    
    carregarProcesso();
    
    console.log('Sistema de acompanhamento inicializado');
});
