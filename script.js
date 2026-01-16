// ========================================
// SISTEMA DE NAVEGAÇÃO VERTICAL COM SCROLL SUAVE
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
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
    // CARREGAR PROCESSO EM EDIÇÃO (SE HOUVER)
    // ========================================
    
    const processoEditandoId = localStorage.getItem('processoEditando');
    let processoAtualId = null; // Armazenar o ID do processo em edição
    
    if (processoEditandoId) {
        const processos = JSON.parse(localStorage.getItem('processos')) || [];
        const processo = processos.find(p => p.id === parseInt(processoEditandoId));
        
        if (processo) {
            processoAtualId = processo.id;
            carregarProcesso(processo);
            console.log('Processo carregado para edição:', processo);
        }
    }
    
    // ========================================
    // SISTEMA DE PESQUISA DE PROCESSOS
    // ========================================

    // Simulação de banco de dados de processos (localStorage)
    let processos = JSON.parse(localStorage.getItem('processos')) || [];

    const searchInput = document.getElementById('search-process');
    const clearSearchBtn = document.getElementById('clear-search');
    const searchResults = document.getElementById('search-results');

    // Função para salvar processo no localStorage
    function salvarProcesso() {
        const processo = {
            id: processoAtualId || Date.now(), // Usar ID existente se estiver editando
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

        if (processoAtualId) {
            // Atualizar processo existente
            const index = processos.findIndex(p => p.id === processoAtualId);
            if (index !== -1) {
                processos[index] = processo;
            }
        } else {
            // Adicionar novo processo
            processos.push(processo);
        }
        
        localStorage.setItem('processos', JSON.stringify(processos));
        return processo;
    }

    // Função para carregar processo no formulário
    function carregarProcesso(processo) {
        document.getElementById('numero-processo').value = processo.numeroProcesso || '';
        document.getElementById('comarca').value = processo.comarca || '';
        document.getElementById('orgao').value = processo.orgao || '';
        document.getElementById('classe-processual').value = processo.classeProcessual || '';
        document.getElementById('natureza-juridica').value = processo.naturezaJuridica || '';
        document.getElementById('valor-causa').value = processo.valorCausa || '';
        document.getElementById('autor').value = processo.autor || '';
        document.getElementById('reu').value = processo.reu || '';
        document.getElementById('advogado').value = processo.advogado || '';
        document.getElementById('data-ajuizamento').value = processo.dataAjuizamento || '';
        document.getElementById('situacao-atual').value = processo.situacaoAtual || '';
        
        // Limpar pesquisa
        searchInput.value = '';
        searchResults.style.display = 'none';
        clearSearchBtn.style.display = 'none';
    }

    // Função para pesquisar processos
    function pesquisarProcessos(termo) {
        if (!termo.trim()) {
            searchResults.style.display = 'none';
            return;
        }

        const termoLower = termo.toLowerCase();
        const resultados = processos.filter(p => {
            const autor = (p.autor || '').toLowerCase();
            const reu = (p.reu || '').toLowerCase();
            const numeroProcesso = (p.numeroProcesso || '').toLowerCase();
            
            return autor.includes(termoLower) || 
                   reu.includes(termoLower) || 
                   numeroProcesso.includes(termoLower);
        });

        exibirResultados(resultados, termo);
    }

    // Função para exibir resultados
    function exibirResultados(resultados, termo) {
        if (resultados.length === 0) {
            searchResults.innerHTML = '<div class="no-results">Nenhum processo encontrado para "' + termo + '"</div>';
            searchResults.style.display = 'block';
            return;
        }

        let html = '';
        resultados.forEach(processo => {
            const cliente = processo.autor || 'Autor não informado';
            const numeroProcesso = processo.numeroProcesso || 'Sem número';
            const situacao = processo.situacaoAtual || 'Sem informação';
            
            html += `
                <div class="search-result-item" data-id="${processo.id}">
                    <div class="search-result-process">${numeroProcesso}</div>
                    <div class="search-result-client">Autor: ${cliente}</div>
                    <div class="search-result-status">Situação: ${situacao}</div>
                </div>
            `;
        });

        searchResults.innerHTML = html;
        searchResults.style.display = 'block';

        // Adicionar eventos de clique nos resultados
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                const processo = processos.find(p => p.id === id);
                if (processo) {
                    carregarProcesso(processo);
                }
            });
        });
    }

    // Event listeners para a pesquisa
    searchInput.addEventListener('input', function() {
        const termo = this.value;
        
        if (termo.trim()) {
            clearSearchBtn.style.display = 'flex';
            pesquisarProcessos(termo);
        } else {
            clearSearchBtn.style.display = 'none';
            searchResults.style.display = 'none';
        }
    });

    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchResults.style.display = 'none';
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
    });

    // Fechar resultados ao clicar fora
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

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
        
        // Salvar processo
        const processo = salvarProcesso();
        
        const acao = processoAtualId ? 'atualizado' : 'cadastrado';
        
        // Feedback visual
        alert(`Dados salvos com sucesso!\n\nProcesso ${acao}!\nNúmero: ${processo.numeroProcesso}\nAutor: ${processo.autor}`);
        
        // Limpar flag de edição
        localStorage.removeItem('processoEditando');
        
        console.log('Processo salvo:', processo);
        console.log('Total de processos:', processos.length);
        
        // Redirecionar para listagem
        window.location.href = 'dashboard.html';
    });

    // ========================================
    // ABA 2: ADICIONAR NOVO ANDAMENTO
    // ========================================

    const btnAddAndamento = document.getElementById('btn-add-andamento');
    const modalAndamento = document.getElementById('modal-andamento');
    const btnFecharModal = document.getElementById('modal-close-andamento');
    const btnCancelarAndamento = document.getElementById('btn-cancelar-andamento');
    const btnSalvarAndamento = document.getElementById('btn-salvar-andamento');
    const tableAndamentos = document.getElementById('table-andamentos');
    
    // Array para armazenar os andamentos (simulação de banco de dados)
    let andamentos = [];
    let andamentoEditandoId = null; // Para controlar se estamos editando

    // Abrir modal ao clicar no botão
    btnAddAndamento.addEventListener('click', function() {
        andamentoEditandoId = null; // Resetar modo edição
        modalAndamento.classList.add('active');
        document.getElementById('andamento-data').value = '';
        document.getElementById('andamento-descricao').value = '';
        document.getElementById('andamento-pdf').value = '';
        document.querySelector('.modal-header h3').textContent = 'Adicionar Novo Andamento';
    });

    // Fechar modal - botão X
    btnFecharModal.addEventListener('click', function() {
        modalAndamento.classList.remove('active');
        andamentoEditandoId = null;
    });

    // Fechar modal - botão Cancelar
    btnCancelarAndamento.addEventListener('click', function() {
        modalAndamento.classList.remove('active');
        andamentoEditandoId = null;
    });

    // Fechar modal ao clicar fora do conteúdo
    modalAndamento.addEventListener('click', function(e) {
        if (e.target === modalAndamento) {
            modalAndamento.classList.remove('active');
            andamentoEditandoId = null;
        }
    });

    // Função para criar os botões de ação
    function criarBotoesAcao(id) {
        return `
            <button class="btn-action btn-edit" data-id="${id}" title="Editar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="btn-action btn-delete" data-id="${id}" title="Excluir">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
    }

    // Função para adicionar eventos aos botões de ação
    function adicionarEventosBotoes() {
        // Botões de editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                editarAndamento(id);
            });
        });

        // Botões de excluir
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                excluirAndamento(id);
            });
        });
    }

    // Função para editar andamento
    function editarAndamento(id) {
        const andamento = andamentos.find(a => a.id === id);
        if (!andamento) return;

        andamentoEditandoId = id;
        
        // Converter data de DD/MM/YYYY para YYYY-MM-DD
        const partesData = andamento.data.split('/');
        const dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
        
        // Preencher o modal com os dados
        document.getElementById('andamento-data').value = dataFormatada;
        document.getElementById('andamento-descricao').value = andamento.descricao;
        document.querySelector('.modal-header h3').textContent = 'Editar Andamento';
        
        // Abrir modal
        modalAndamento.classList.add('active');
    }

    // Função para excluir andamento
    function excluirAndamento(id) {
        if (!confirm('Tem certeza que deseja excluir este andamento?')) {
            return;
        }

        // Remover do array
        andamentos = andamentos.filter(a => a.id !== id);

        // Remover da tabela
        const linha = document.querySelector(`#table-andamentos tr[data-id="${id}"]`);
        if (linha) {
            linha.remove();
        }

        console.log('Andamento excluído. Total de andamentos:', andamentos.length);
    }

    // Salvar novo andamento ou editar existente
    btnSalvarAndamento.addEventListener('click', function() {
        const data = document.getElementById('andamento-data').value;
        const descricao = document.getElementById('andamento-descricao').value;
        const arquivoPdf = document.getElementById('andamento-pdf').files[0];

        // Validação
        if (!data || !descricao) {
            alert('Por favor, preencha a data e a descrição do andamento.');
            return;
        }

        // Formatar data para exibição (DD/MM/YYYY)
        const dataFormatada = data.split('-').reverse().join('/');
        
        // Nome do arquivo PDF (se houver)
        const nomePdf = arquivoPdf ? arquivoPdf.name : null;

        if (andamentoEditandoId) {
            // Modo edição - atualizar andamento existente
            const andamento = andamentos.find(a => a.id === andamentoEditandoId);
            if (andamento) {
                andamento.data = dataFormatada;
                andamento.descricao = descricao;
                if (nomePdf) andamento.pdf = nomePdf;

                // Atualizar linha na tabela
                const linha = document.querySelector(`#table-andamentos tr[data-id="${andamentoEditandoId}"]`);
                if (linha) {
                    linha.innerHTML = `
                        <td>${dataFormatada}</td>
                        <td>${descricao}</td>
                        <td>${andamento.pdf ? `<button class="btn btn-link">${andamento.pdf}</button>` : '-'}</td>
                        <td>${criarBotoesAcao(andamentoEditandoId)}</td>
                    `;
                }

                console.log('Andamento editado:', andamento);
            }
        } else {
            // Modo criação - adicionar novo andamento
            const novoAndamento = {
                id: Date.now(),
                data: dataFormatada,
                descricao: descricao,
                pdf: nomePdf
            };

            // Adicionar ao array
            andamentos.push(novoAndamento);

            // Adicionar nova linha à tabela
            const novaLinha = document.createElement('tr');
            novaLinha.dataset.id = novoAndamento.id;
            novaLinha.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${descricao}</td>
                <td>${nomePdf ? `<button class="btn btn-link">${nomePdf}</button>` : '-'}</td>
                <td>${criarBotoesAcao(novoAndamento.id)}</td>
            `;
            
            tableAndamentos.appendChild(novaLinha);

            console.log('Andamento adicionado:', novoAndamento);
        }

        // Adicionar eventos aos novos botões
        adicionarEventosBotoes();

        // Fechar modal
        modalAndamento.classList.remove('active');
        andamentoEditandoId = null;

        console.log('Total de andamentos:', andamentos.length);
    });

    // Adicionar eventos aos botões existentes no carregamento da página
    adicionarEventosBotoes();

    // ========================================
    // ALERTAS E PRAZOS (O DESPERTADOR)
    // ========================================

    const btnAddPrazo = document.getElementById('btn-add-prazo');
    const modalPrazo = document.getElementById('modal-prazo');
    const btnFecharModalPrazo = document.getElementById('modal-close-prazo');
    const btnCancelarPrazo = document.getElementById('btn-cancelar-prazo');
    const btnSalvarPrazo = document.getElementById('btn-salvar-prazo');
    const tablePrazos = document.getElementById('table-prazos');
    
    // Array para armazenar os prazos
    let prazos = [];
    let prazoEditandoId = null;

    // Função para calcular dias restantes
    function calcularDiasRestantes(dataLimite) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const partes = dataLimite.split('/');
        const dataFinal = new Date(partes[2], partes[1] - 1, partes[0]);
        dataFinal.setHours(0, 0, 0, 0);
        
        const diferencaMs = dataFinal - hoje;
        const diasRestantes = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
        
        return diasRestantes;
    }

    // Função para enviar alerta via WhatsApp
    function enviarAlertaWhatsApp(prazo, diasRestantes) {
        // Número de telefone (substitua pelo seu número no formato internacional)
        // Exemplo: 5511999999999 (país + DDD + número)
        const numeroWhatsApp = '5511999999999'; // ALTERE AQUI!
        
        let mensagem = `🚨 *ALERTA DE PRAZO URGENTE* 🚨%0A%0A`;
        mensagem += `📋 *Descrição:* ${prazo.descricao}%0A`;
        mensagem += `📅 *Data Limite:* ${prazo.dataLimite}%0A`;
        
        if (diasRestantes === 0) {
            mensagem += `⏰ *VENCE HOJE!*`;
        } else if (diasRestantes === 1) {
            mensagem += `⏰ *VENCE AMANHÃ!*`;
        } else if (diasRestantes < 0) {
            mensagem += `❌ *VENCIDO há ${Math.abs(diasRestantes)} dias!*`;
        } else {
            mensagem += `⏰ *Faltam apenas ${diasRestantes} dias!*`;
        }
        
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
        
        // Abrir WhatsApp em nova aba
        window.open(urlWhatsApp, '_blank');
        
        console.log('Alerta enviado via WhatsApp para prazo:', prazo.descricao);
    }

    // Função para criar botões de ação para prazos
    function criarBotoesAcaoPrazo(id) {
        return `
            <button class="btn-action btn-edit" data-prazo-id="${id}" title="Editar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="btn-action btn-delete" data-prazo-id="${id}" title="Excluir">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
    }

    // Função para adicionar eventos aos botões de prazos
    function adicionarEventosBotoesPrazo() {
        // Botões de editar
        document.querySelectorAll('[data-prazo-id]').forEach(btn => {
            if (btn.classList.contains('btn-edit')) {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.dataset.prazoId);
                    editarPrazo(id);
                });
            } else if (btn.classList.contains('btn-delete')) {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.dataset.prazoId);
                    excluirPrazo(id);
                });
            }
        });
    }

    // Função para renderizar a tabela de prazos
    function renderizarPrazos() {
        if (prazos.length === 0) {
            tablePrazos.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #6b7280;">Nenhum prazo cadastrado</td></tr>';
            return;
        }

        tablePrazos.innerHTML = '';
        
        prazos.forEach(prazo => {
            const diasRestantes = calcularDiasRestantes(prazo.dataLimite);
            
            // Verificar se precisa enviar alerta
            if (diasRestantes <= 1 && !prazo.alertaEnviado) {
                enviarAlertaWhatsApp(prazo, diasRestantes);
                prazo.alertaEnviado = true;
            }
            
            const novaLinha = document.createElement('tr');
            novaLinha.dataset.prazoId = prazo.id;
            
            // Aplicar classes de estilo baseado nos dias restantes
            if (diasRestantes <= 1) {
                novaLinha.classList.add('prazo-urgente');
            } else if (diasRestantes <= 3) {
                novaLinha.classList.add('prazo-alerta');
            }
            
            // Formatar texto dos dias restantes
            let textoRestantes = '';
            let classeRestantes = '';
            
            if (diasRestantes < 0) {
                textoRestantes = `Vencido há ${Math.abs(diasRestantes)} dias`;
                classeRestantes = 'dias-restantes-urgente';
            } else if (diasRestantes === 0) {
                textoRestantes = 'VENCE HOJE!';
                classeRestantes = 'dias-restantes-urgente';
            } else if (diasRestantes === 1) {
                textoRestantes = 'Vence amanhã';
                classeRestantes = 'dias-restantes-urgente';
            } else if (diasRestantes <= 3) {
                textoRestantes = `${diasRestantes} dias`;
                classeRestantes = 'dias-restantes-alerta';
            } else {
                textoRestantes = `${diasRestantes} dias`;
            }
            
            novaLinha.innerHTML = `
                <td>${prazo.descricao}</td>
                <td>${prazo.dataLimite}</td>
                <td><span class="${classeRestantes}">${textoRestantes}</span></td>
                <td>${criarBotoesAcaoPrazo(prazo.id)}</td>
            `;
            
            tablePrazos.appendChild(novaLinha);
        });
        
        adicionarEventosBotoesPrazo();
    }

    // Abrir modal
    btnAddPrazo.addEventListener('click', function() {
        prazoEditandoId = null;
        modalPrazo.classList.add('active');
        document.getElementById('prazo-descricao').value = '';
        document.getElementById('prazo-data').value = '';
        document.querySelector('#modal-prazo .modal-header h3').textContent = 'Adicionar Novo Prazo';
    });

    // Fechar modal
    btnFecharModalPrazo.addEventListener('click', function() {
        modalPrazo.classList.remove('active');
        prazoEditandoId = null;
    });

    btnCancelarPrazo.addEventListener('click', function() {
        modalPrazo.classList.remove('active');
        prazoEditandoId = null;
    });

    modalPrazo.addEventListener('click', function(e) {
        if (e.target === modalPrazo) {
            modalPrazo.classList.remove('active');
            prazoEditandoId = null;
        }
    });

    // Função para editar prazo
    function editarPrazo(id) {
        const prazo = prazos.find(p => p.id === id);
        if (!prazo) return;

        prazoEditandoId = id;
        
        // Converter data de DD/MM/YYYY para YYYY-MM-DD
        const partesData = prazo.dataLimite.split('/');
        const dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
        
        document.getElementById('prazo-descricao').value = prazo.descricao;
        document.getElementById('prazo-data').value = dataFormatada;
        document.querySelector('#modal-prazo .modal-header h3').textContent = 'Editar Prazo';
        
        modalPrazo.classList.add('active');
    }

    // Função para excluir prazo
    function excluirPrazo(id) {
        if (!confirm('Tem certeza que deseja excluir este prazo?')) {
            return;
        }

        prazos = prazos.filter(p => p.id !== id);
        renderizarPrazos();
        
        console.log('Prazo excluído. Total de prazos:', prazos.length);
    }

    // Salvar prazo
    btnSalvarPrazo.addEventListener('click', function() {
        const descricao = document.getElementById('prazo-descricao').value;
        const data = document.getElementById('prazo-data').value;

        if (!descricao || !data) {
            alert('Por favor, preencha a descrição e a data limite.');
            return;
        }

        // Formatar data para DD/MM/YYYY
        const dataFormatada = data.split('-').reverse().join('/');

        if (prazoEditandoId) {
            // Editar prazo existente
            const prazo = prazos.find(p => p.id === prazoEditandoId);
            if (prazo) {
                prazo.descricao = descricao;
                prazo.dataLimite = dataFormatada;
                prazo.alertaEnviado = false; // Resetar alerta ao editar
                console.log('Prazo editado:', prazo);
            }
        } else {
            // Criar novo prazo
            const novoPrazo = {
                id: Date.now(),
                descricao: descricao,
                dataLimite: dataFormatada,
                alertaEnviado: false
            };
            
            prazos.push(novoPrazo);
            console.log('Prazo adicionado:', novoPrazo);
        }

        renderizarPrazos();
        modalPrazo.classList.remove('active');
        prazoEditandoId = null;
        
        console.log('Total de prazos:', prazos.length);
    });

    // Atualizar prazos a cada minuto para verificar mudanças de dia
    setInterval(renderizarPrazos, 60000);

    // ========================================
    // ABA 2: PROVIDÊNCIAS - SISTEMA COMPLETO COM MODAL
    // ========================================

    const btnAddProvidencia = document.getElementById('btn-add-providencia');
    const modalProvidencia = document.getElementById('modal-providencia');
    const btnFecharModalProvidencia = document.getElementById('modal-close-providencia');
    const btnCancelarProvidencia = document.getElementById('btn-cancelar-providencia');
    const btnSalvarProvidencia = document.getElementById('btn-salvar-providencia');
    const tableProvidencias = document.getElementById('table-providencias');
    
    // Array para armazenar as providências
    let providencias = JSON.parse(localStorage.getItem('providencias')) || [];
    let providenciaEditandoId = null;

    // Função para criar botões de ação para providências
    function criarBotoesAcaoProvidencia(id) {
        return `
            <button class="btn-action btn-edit" data-providencia-id="${id}" title="Editar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="btn-action btn-delete" data-providencia-id="${id}" title="Excluir">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
    }

    // Função para adicionar eventos aos botões de providências
    function adicionarEventosBotoesProvidencia() {
        document.querySelectorAll('[data-providencia-id]').forEach(btn => {
            if (btn.classList.contains('btn-edit')) {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.dataset.providenciaId);
                    editarProvidencia(id);
                });
            } else if (btn.classList.contains('btn-delete')) {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.dataset.providenciaId);
                    excluirProvidencia(id);
                });
            }
        });
        
        // Adicionar evento de mudança aos selects de status
        document.querySelectorAll('.status-select-providencia').forEach(select => {
            select.addEventListener('change', function() {
                const id = parseInt(this.dataset.providenciaId);
                const novoStatus = this.value;
                atualizarStatusProvidencia(id, novoStatus);
            });
        });
    }

    // Função para salvar providências no localStorage
    function salvarProvidencias() {
        localStorage.setItem('providencias', JSON.stringify(providencias));
    }

    // Função para renderizar a tabela de providências
    function renderizarProvidencias() {
        if (providencias.length === 0) {
            tableProvidencias.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #6b7280;">Nenhuma providência cadastrada</td></tr>';
            return;
        }

        tableProvidencias.innerHTML = '';
        
        providencias.forEach(providencia => {
            const novaLinha = document.createElement('tr');
            novaLinha.dataset.providenciaId = providencia.id;
            
            novaLinha.innerHTML = `
                <td>${providencia.tarefa}</td>
                <td>${providencia.responsavel}</td>
                <td>
                    <select class="status-select status-select-providencia" data-providencia-id="${providencia.id}">
                        <option value="Pendente" ${providencia.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Em andamento" ${providencia.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
                        <option value="Concluída" ${providencia.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                    </select>
                </td>
                <td>${criarBotoesAcaoProvidencia(providencia.id)}</td>
            `;
            
            tableProvidencias.appendChild(novaLinha);
        });
        
        adicionarEventosBotoesProvidencia();
    }

    // Abrir modal de providência
    btnAddProvidencia.addEventListener('click', function() {
        providenciaEditandoId = null;
        modalProvidencia.classList.add('active');
        document.getElementById('providencia-tarefa').value = '';
        document.getElementById('providencia-responsavel').value = '';
        document.querySelector('#modal-providencia .modal-header h3').textContent = 'Adicionar Nova Providência';
    });

    // Fechar modal de providência
    btnFecharModalProvidencia.addEventListener('click', function() {
        modalProvidencia.classList.remove('active');
        providenciaEditandoId = null;
    });

    btnCancelarProvidencia.addEventListener('click', function() {
        modalProvidencia.classList.remove('active');
        providenciaEditandoId = null;
    });

    modalProvidencia.addEventListener('click', function(e) {
        if (e.target === modalProvidencia) {
            modalProvidencia.classList.remove('active');
            providenciaEditandoId = null;
        }
    });

    // Função para editar providência
    function editarProvidencia(id) {
        const providencia = providencias.find(p => p.id === id);
        if (!providencia) return;

        providenciaEditandoId = id;
        
        document.getElementById('providencia-tarefa').value = providencia.tarefa;
        document.getElementById('providencia-responsavel').value = providencia.responsavel;
        document.querySelector('#modal-providencia .modal-header h3').textContent = 'Editar Providência';
        
        modalProvidencia.classList.add('active');
    }

    // Função para excluir providência
    function excluirProvidencia(id) {
        if (!confirm('Tem certeza que deseja excluir esta providência?')) {
            return;
        }

        providencias = providencias.filter(p => p.id !== id);
        salvarProvidencias();
        renderizarProvidencias();
        
        console.log('Providência excluída. Total de providências:', providencias.length);
    }

    // Função para atualizar status da providência
    function atualizarStatusProvidencia(id, novoStatus) {
        const providencia = providencias.find(p => p.id === id);
        if (providencia) {
            providencia.status = novoStatus;
            salvarProvidencias();
            console.log('Status da providência atualizado:', providencia);
        }
    }

    // Salvar providência (nova ou editar)
    btnSalvarProvidencia.addEventListener('click', function() {
        const tarefa = document.getElementById('providencia-tarefa').value;
        const responsavel = document.getElementById('providencia-responsavel').value;

        if (!tarefa || !responsavel) {
            alert('Por favor, preencha a tarefa e o responsável.');
            return;
        }

        if (providenciaEditandoId) {
            // Editar providência existente
            const providencia = providencias.find(p => p.id === providenciaEditandoId);
            if (providencia) {
                providencia.tarefa = tarefa;
                providencia.responsavel = responsavel;
                console.log('Providência editada:', providencia);
            }
        } else {
            // Criar nova providência
            const novaProvidencia = {
                id: Date.now(),
                tarefa: tarefa,
                responsavel: responsavel,
                status: 'Pendente',
                dataCriacao: new Date().toISOString()
            };
            
            providencias.push(novaProvidencia);
            console.log('Providência adicionada:', novaProvidencia);
        }

        salvarProvidencias();
        renderizarProvidencias();
        modalProvidencia.classList.remove('active');
        providenciaEditandoId = null;
        
        console.log('Total de providências:', providencias.length);
    });

    // Renderizar providências ao carregar a página
    renderizarProvidencias();

    // ========================================
    // ABA 2: OBSERVAÇÕES TÉCNICAS
    // ========================================

    const btnSalvarObservacoes = document.getElementById('btn-salvar-observacoes');
    const observacoesTecnicas = document.getElementById('observacoes-tecnicas');
    
    // Carregar observações salvas ao iniciar
    const observacoesSalvas = localStorage.getItem('observacoes-tecnicas');
    if (observacoesSalvas) {
        observacoesTecnicas.value = observacoesSalvas;
    }
    
    // Salvar observações
    btnSalvarObservacoes.addEventListener('click', function() {
        const textoObservacoes = observacoesTecnicas.value;
        
        localStorage.setItem('observacoes-tecnicas', textoObservacoes);
        
        // Feedback visual
        const textoOriginal = this.textContent;
        this.textContent = '✓ Salvo!';
        this.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            this.textContent = textoOriginal;
            this.style.backgroundColor = '';
        }, 2000);
        
        console.log('Observações técnicas salvas');
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
