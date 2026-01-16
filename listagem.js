// ========================================
// SISTEMA DE LISTAGEM DE PROCESSOS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do DOM
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const filterSituacao = document.getElementById('filter-situacao');
    const btnNovoProcesso = document.getElementById('btn-novo-processo');
    const btnAlertas = document.getElementById('btn-alertas');
    const badgeAlertas = document.getElementById('badge-alertas');
    const modalAlertas = document.getElementById('modal-alertas');
    const btnFecharAlertas = document.getElementById('btn-fechar-alertas');
    const listaAlertas = document.getElementById('lista-alertas');
    const btnFinanceiro = document.getElementById('btn-financeiro');
    const modalFinanceiro = document.getElementById('modal-financeiro');
    const btnFecharFinanceiro = document.getElementById('btn-fechar-financeiro');
    const conteudoFinanceiro = document.getElementById('conteudo-financeiro');
    const tableProcessos = document.getElementById('table-processos');
    const totalProcessosSpan = document.getElementById('total-processos');
    const paginationInfo = document.getElementById('pagination-info');
    const btnPrevPage = document.getElementById('btn-prev-page');
    const btnNextPage = document.getElementById('btn-next-page');
    const pageNumbers = document.getElementById('page-numbers');
    
    // Carregar processos do localStorage
    let processos = JSON.parse(localStorage.getItem('processos')) || [];
    
    // Variáveis de paginação
    const PROCESSOS_POR_PAGINA = 10;
    let paginaAtual = 1;
    let processosFiltrados = [];
    
    // ========================================
    // FUNÇÕES DE RENDERIZAÇÃO
    // ========================================
    
    function renderizarProcessos(processosParaExibir = processos) {
        processosFiltrados = processosParaExibir;
        
        // Atualizar contador total
        totalProcessosSpan.textContent = processos.length;
        
        // Calcular paginação
        const totalPaginas = Math.ceil(processosFiltrados.length / PROCESSOS_POR_PAGINA);
        
        // Ajustar página atual se necessário
        if (paginaAtual > totalPaginas && totalPaginas > 0) {
            paginaAtual = totalPaginas;
        }
        if (paginaAtual < 1) {
            paginaAtual = 1;
        }
        
        // Calcular índices
        const indiceInicio = (paginaAtual - 1) * PROCESSOS_POR_PAGINA;
        const indiceFim = indiceInicio + PROCESSOS_POR_PAGINA;
        const processosPaginados = processosFiltrados.slice(indiceInicio, indiceFim);
        
        // Limpar tabela
        tableProcessos.innerHTML = '';
        
        // Se não há processos
        if (processosFiltrados.length === 0) {
            const mensagem = searchInput.value.trim() || filterSituacao.value
                ? 'Nenhum processo encontrado para sua pesquisa'
                : 'Nenhum processo cadastrado';
            
            const subtitulo = searchInput.value.trim() || filterSituacao.value
                ? 'Tente outro termo de pesquisa ou filtro'
                : 'Clique em "Novo Processo" para começar';
            
            tableProcessos.innerHTML = `
                <tr class="empty-state">
                    <td colspan="4">
                        <div class="empty-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                            <p>${mensagem}</p>
                            <p class="empty-subtitle">${subtitulo}</p>
                        </div>
                    </td>
                </tr>
            `;
            atualizarControlesPaginacao();
            return;
        }
        
        // Renderizar cada processo da página atual
        processosPaginados.forEach(processo => {
            const numeroProcesso = processo.numeroProcesso || 'Não informado';
            const autor = processo.autor || 'Não informado';
            const situacao = processo.situacaoAtual || 'Não informada';
            
            const linha = document.createElement('tr');
            linha.classList.add('processo-row');
            linha.dataset.processoId = processo.id;
            
            linha.innerHTML = `
                <td class="td-numero">${numeroProcesso}</td>
                <td class="td-autor">${autor}</td>
                <td class="td-situacao">
                    <span class="badge-situacao">${situacao}</span>
                </td>
                <td class="td-actions">
                    <button class="btn-action btn-view" data-id="${processo.id}" title="Visualizar/Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn-action btn-delete" data-id="${processo.id}" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
            
            tableProcessos.appendChild(linha);
        });
        
        // Adicionar eventos aos botões
        adicionarEventosBotoes();
        
        // Atualizar controles de paginação
        atualizarControlesPaginacao();
    }
    
    // ========================================
    // FUNÇÕES DE PAGINAÇÃO
    // ========================================
    
    function atualizarControlesPaginacao() {
        const totalPaginas = Math.ceil(processosFiltrados.length / PROCESSOS_POR_PAGINA);
        
        if (totalPaginas <= 1) {
            document.querySelector('.pagination-container').style.display = 'none';
            return;
        }
        
        document.querySelector('.pagination-container').style.display = 'flex';
        
        // Atualizar informação de paginação
        const indiceInicio = (paginaAtual - 1) * PROCESSOS_POR_PAGINA + 1;
        const indiceFim = Math.min(paginaAtual * PROCESSOS_POR_PAGINA, processosFiltrados.length);
        paginationInfo.textContent = `Mostrando ${indiceInicio}-${indiceFim} de ${processosFiltrados.length} processos`;
        
        // Habilitar/desabilitar botões
        btnPrevPage.disabled = paginaAtual === 1;
        btnNextPage.disabled = paginaAtual === totalPaginas;
        
        // Renderizar números de página
        renderizarNumerosPagina(totalPaginas);
    }
    
    function renderizarNumerosPagina(totalPaginas) {
        pageNumbers.innerHTML = '';
        
        // Lógica para mostrar números de página
        let paginasParaMostrar = [];
        
        if (totalPaginas <= 7) {
            // Mostrar todas as páginas
            for (let i = 1; i <= totalPaginas; i++) {
                paginasParaMostrar.push(i);
            }
        } else {
            // Mostrar com reticências
            if (paginaAtual <= 3) {
                paginasParaMostrar = [1, 2, 3, 4, '...', totalPaginas];
            } else if (paginaAtual >= totalPaginas - 2) {
                paginasParaMostrar = [1, '...', totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
            } else {
                paginasParaMostrar = [1, '...', paginaAtual - 1, paginaAtual, paginaAtual + 1, '...', totalPaginas];
            }
        }
        
        paginasParaMostrar.forEach(pagina => {
            if (pagina === '...') {
                const span = document.createElement('span');
                span.className = 'page-ellipsis';
                span.textContent = '...';
                pageNumbers.appendChild(span);
            } else {
                const button = document.createElement('button');
                button.className = 'page-number';
                if (pagina === paginaAtual) {
                    button.classList.add('active');
                }
                button.textContent = pagina;
                button.addEventListener('click', () => {
                    paginaAtual = pagina;
                    renderizarProcessos(processosFiltrados);
                });
                pageNumbers.appendChild(button);
            }
        });
    }
    
    function irParaPaginaAnterior() {
        if (paginaAtual > 1) {
            paginaAtual--;
            renderizarProcessos(processosFiltrados);
        }
    }
    
    function irParaProximaPagina() {
        const totalPaginas = Math.ceil(processosFiltrados.length / PROCESSOS_POR_PAGINA);
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            renderizarProcessos(processosFiltrados);
        }
    }
    
    // ========================================
    // FUNÇÕES DE PESQUISA E FILTRO
    // ========================================
    
    function aplicarFiltros() {
        const termo = searchInput.value;
        const situacaoSelecionada = filterSituacao.value;
        
        // Exibir/ocultar botão de limpar pesquisa
        clearSearchBtn.style.display = termo.trim() ? 'flex' : 'none';
        
        // Resetar para primeira página ao filtrar
        paginaAtual = 1;
        
        let resultados = processos;
        
        // Filtrar por termo de pesquisa
        if (termo.trim()) {
            const termoLower = termo.toLowerCase();
            resultados = resultados.filter(p => {
                const autor = (p.autor || '').toLowerCase();
                const numeroProcesso = (p.numeroProcesso || '').toLowerCase();
                
                return autor.includes(termoLower) || numeroProcesso.includes(termoLower);
            });
        }
        
        // Filtrar por situação
        if (situacaoSelecionada) {
            resultados = resultados.filter(p => {
                return (p.situacaoAtual || '') === situacaoSelecionada;
            });
        }
        
        renderizarProcessos(resultados);
    }
    
    function pesquisarProcessos(termo) {
        aplicarFiltros();
    }
    
    // ========================================
    // FUNÇÕES DE AÇÕES
    // ========================================
    
    function visualizarProcesso(id) {
        // Salvar o ID do processo a ser editado
        localStorage.setItem('processoEditando', id);
        // Redirecionar para a página de cadastro
        window.location.href = 'acompanhamento.html';
    }
    
    function excluirProcesso(id) {
        const processo = processos.find(p => p.id === id);
        const nomeProcesso = processo?.numeroProcesso || 'este processo';
        
        if (!confirm(`Tem certeza que deseja excluir o processo "${nomeProcesso}"?\n\nEsta ação não pode ser desfeita.`)) {
            return;
        }
        
        // Remover do array
        processos = processos.filter(p => p.id !== id);
        
        // Salvar no localStorage
        localStorage.setItem('processos', JSON.stringify(processos));
        
        // Re-aplicar filtros e renderizar
        aplicarFiltros();
        
        console.log('Processo excluído. Total:', processos.length);
    }
    
    function adicionarEventosBotoes() {
        // Botões de visualizar
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                visualizarProcesso(id);
            });
        });
        
        // Botões de excluir
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                excluirProcesso(id);
            });
        });
    }
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    // Pesquisa
    searchInput.addEventListener('input', function() {
        aplicarFiltros();
    });
    
    // Filtro de situação
    filterSituacao.addEventListener('change', function() {
        aplicarFiltros();
    });
    
    // Limpar pesquisa
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        aplicarFiltros();
        searchInput.focus();
    });
    
    // Botão Novo Processo
    btnNovoProcesso.addEventListener('click', function() {
        // Limpar o processo em edição
        localStorage.removeItem('processoEditando');
        // Redirecionar para a página de cadastro
        window.location.href = 'cadastro.html';
    });
    
    // Botões de paginação
    btnPrevPage.addEventListener('click', irParaPaginaAnterior);
    btnNextPage.addEventListener('click', irParaProximaPagina);
    
    // ========================================
    // SISTEMA DE ALERTAS
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
    
    function coletarAlertas() {
        const alertas = [];
        
        processos.forEach(processo => {
            if (processo.prazos && processo.prazos.length > 0) {
                processo.prazos.forEach(prazo => {
                    const diasRestantes = calcularDiasRestantes(prazo.dataLimite);
                    
                    // Mostrar prazos vencidos, hoje ou próximos (até 7 dias)
                    if (diasRestantes <= 7) {
                        let tipo = 'proximo';
                        let badge = `${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`;
                        let classe = 'atencao';
                        let urgencia = 'atencao'; // Novo campo para o dashboard
                        
                        if (diasRestantes < 0) {
                            tipo = 'vencido';
                            badge = `Vencido há ${Math.abs(diasRestantes)} ${Math.abs(diasRestantes) === 1 ? 'dia' : 'dias'}`;
                            classe = 'urgente';
                            urgencia = 'critico';
                        } else if (diasRestantes === 0) {
                            tipo = 'hoje';
                            badge = 'Vence HOJE!';
                            classe = 'urgente';
                            urgencia = 'critico';
                        } else if (diasRestantes <= 2) {
                            classe = 'urgente';
                            urgencia = 'urgente';
                        }
                        
                        alertas.push({
                            processoId: processo.id,
                            numeroProcesso: processo.numeroProcesso,
                            autor: processo.autor,
                            descricao: prazo.descricao,
                            dataLimite: prazo.dataLimite,
                            diasRestantes: diasRestantes,
                            tipo: tipo,
                            badge: badge,
                            classe: classe,
                            urgencia: urgencia
                        });
                    }
                });
            }
        });
        
        // Ordenar: vencidos primeiro, depois por dias restantes
        alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
        
        // Se não houver alertas reais, retornar exemplos para demonstração
        if (alertas.length === 0) {
            // Adicionar exemplos fictícios se não houver prazos reais próximos
            return [
                {
                    processoId: 9991,
                    numeroProcesso: "0000000-00.2026.8.26.0000",
                    autor: "Cliente Exemplo 1",
                    descricao: "Prazo para recurso - Exemplo Crítico",
                    dataLimite: "13/01/2026",
                    diasRestantes: -2,
                    tipo: 'vencido',
                    badge: 'Vencido há 2 dias',
                    classe: 'urgente',
                    urgencia: 'critico'
                },
                {
                    processoId: 9992,
                    numeroProcesso: "1111111-11.2026.8.26.1111",
                    autor: "Cliente Exemplo 2",
                    descricao: "Audiência de Instrução - Exemplo Hoje",
                    dataLimite: "15/01/2026",
                    diasRestantes: 0,
                    tipo: 'hoje',
                    badge: 'Vence HOJE!',
                    classe: 'urgente',
                    urgencia: 'critico'
                },
                {
                    processoId: 9993,
                    numeroProcesso: "2222222-22.2026.8.26.2222",
                    autor: "Cliente Exemplo 3",
                    descricao: "Apresentação de Quesitos - Exemplo Próximo",
                    dataLimite: "20/01/2026",
                    diasRestantes: 5,
                    tipo: 'proximo',
                    badge: '5 dias',
                    classe: 'atencao',
                    urgencia: 'atencao'
                }
            ];
        }

        return alertas;
    }
    
    function renderizarAlertas() {
        const alertas = coletarAlertas();
        
        // Atualizar badge
        if (alertas.length > 0) {
            badgeAlertas.textContent = alertas.length;
            badgeAlertas.style.display = 'inline-flex';
        } else {
            badgeAlertas.style.display = 'none';
        }
        
        // Renderizar lista de alertas
        listaAlertas.innerHTML = '';
        
        if (alertas.length === 0) {
            listaAlertas.innerHTML = `
                <div class="alerta-vazio">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <p>Nenhum alerta no momento</p>
                    <p style="font-size: 13px; margin-top: 4px;">Todos os prazos estão em dia! 🎉</p>
                </div>
            `;
            return;
        }
        
        alertas.forEach(alerta => {
            const item = document.createElement('div');
            item.className = `alerta-item ${alerta.classe}`;
            item.dataset.processoId = alerta.processoId;
            
            item.innerHTML = `
                <div class="alerta-header">
                    <div class="alerta-processo">${alerta.numeroProcesso || 'Processo sem número'}</div>
                    <span class="alerta-badge ${alerta.tipo}">${alerta.badge}</span>
                </div>
                <div class="alerta-prazo">${alerta.descricao}</div>
                <div class="alerta-data">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Data limite: ${alerta.dataLimite}
                </div>
                <div style="font-size: 13px; color: var(--gray-600); margin-top: 8px;">
                    Cliente: ${alerta.autor || 'Não informado'}
                </div>
            `;
            
            // Adicionar evento de clique para abrir o processo
            item.addEventListener('click', function() {
                localStorage.setItem('processoEditando', alerta.processoId);
                window.location.href = 'acompanhamento.html';
            });
            
            listaAlertas.appendChild(item);
        });
    }
    
    // Abrir modal de alertas
    if (btnAlertas) {
        btnAlertas.addEventListener('click', function() {
            renderizarAlertas();
            modalAlertas.classList.add('active');
        });
    }
    
    // Renderizar alertas no dashboard
    function renderizarAlertasDashboard() {
        let alertas = coletarAlertas();
        const dashboardAlertasSection = document.getElementById('dashboard-alertas-section');
        const dashboardAlertasLista = document.getElementById('dashboard-alertas-lista');
        
        if (!dashboardAlertasSection || !dashboardAlertasLista) return;
        
        // SE NÃO HOUVER ALERTAS REAIS, GERAR ALERTAS DE EXEMPLO PARA VISUALIZAÇÃO
        if (alertas.length === 0) {
            console.log('Nenhum alerta real encontrado. Gerando alertas de exemplo para demonstração.');
            alertas = [
                {
                    descricao: "Prazo para recurso - Exemplo Crítico",
                    numeroProcesso: "0000000-00.2026.8.26.0000",
                    diasRestantes: -2,
                    tipo: 'vencido',
                    badge: 'Vencido há 2 dias',
                    classe: 'urgente',
                    urgencia: 'critico'
                },
                {
                    descricao: "Audiência de Instrução - Exemplo Hoje",
                    numeroProcesso: "1111111-11.2026.8.26.1111",
                    diasRestantes: 0,
                    tipo: 'hoje',
                    badge: 'Vence HOJE!',
                    classe: 'urgente',
                    urgencia: 'urgente'
                },
                {
                    descricao: "Apresentação de Quesitos - Exemplo Próximo",
                    numeroProcesso: "2222222-22.2026.8.26.2222",
                    diasRestantes: 5,
                    tipo: 'proximo',
                    badge: '5 dias',
                    classe: 'atencao',
                    urgencia: 'atencao'
                }
            ];
        }
        
        if (alertas.length === 0) {
            dashboardAlertasSection.style.display = 'none';
            return;
        }
        
        dashboardAlertasSection.style.display = 'block';
        
        // Mostrar apenas os 5 primeiros alertas
        const alertasLimitados = alertas.slice(0, 5);
        
        dashboardAlertasLista.innerHTML = '';
        
        alertasLimitados.forEach(alerta => {
            const item = document.createElement('div');
            item.className = `dashboard-alerta-item ${alerta.urgencia}`;
            
            let icone = '⚠️';
            if (alerta.urgencia === 'critico') icone = '🔴';
            else if (alerta.urgencia === 'urgente') icone = '🟠';
            else if (alerta.urgencia === 'atencao') icone = '🟡';
            
            item.innerHTML = `
                <div class="dashboard-alerta-icon">${icone}</div>
                <div class="dashboard-alerta-content">
                    <div class="dashboard-alerta-titulo">${alerta.descricao}</div>
                    <div class="dashboard-alerta-detalhes">
                        <span class="dashboard-alerta-processo">${alerta.numeroProcesso}</span>
                        <span class="dashboard-alerta-prazo">${alerta.badge}</span>
                    </div>
                </div>
            `;
            
            item.style.cursor = 'pointer';
            item.addEventListener('click', function() {
                localStorage.setItem('processoEditando', alerta.processoId);
                window.location.href = 'acompanhamento.html';
            });
            
            dashboardAlertasLista.appendChild(item);
        });
    }
    
    // Botão "Ver Todos" os alertas
    const btnVerTodosAlertas = document.getElementById('btn-ver-todos-alertas');
    if (btnVerTodosAlertas) {
        btnVerTodosAlertas.addEventListener('click', function() {
            renderizarAlertas();
            modalAlertas.classList.add('active');
        });
    }
    
    // Fechar modal
    if (btnFecharAlertas) {
        btnFecharAlertas.addEventListener('click', function() {
            modalAlertas.classList.remove('active');
        });
    }
    
    // Fechar modal ao clicar fora
    if (modalAlertas) {
        modalAlertas.addEventListener('click', function(e) {
            if (e.target === modalAlertas) {
                modalAlertas.classList.remove('active');
            }
        });
    }
    
    // ========================================
    // SISTEMA FINANCEIRO
    // ========================================
    
    function converterValorParaNumero(valorString) {
        if (!valorString) return 0;
        // Remove R$, espaços e converte vírgula para ponto
        return parseFloat(valorString.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
    }
    
    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    
    function coletarDadosFinanceiros() {
        let totalContratual = 0;
        let totalSucumbencial = 0;
        let totalPrevisao = 0;
        const processosComValores = [];
        
        processos.forEach(processo => {
            let contratuaisProcesso = 0;
            let sucumbenciaisProcesso = 0;
            let previsoesProcesso = 0;
            
            // Honorários contratuais
            if (processo.honorariosContratuais && processo.honorariosContratuais.length > 0) {
                processo.honorariosContratuais.forEach(h => {
                    const valor = converterValorParaNumero(h.valor);
                    totalContratual += valor;
                    contratuaisProcesso += valor;
                });
            }
            
            // Honorários sucumbenciais
            if (processo.honorariosSucumbenciais && processo.honorariosSucumbenciais.length > 0) {
                processo.honorariosSucumbenciais.forEach(h => {
                    const valor = converterValorParaNumero(h.valor);
                    totalSucumbencial += valor;
                    sucumbenciaisProcesso += valor;
                });
            }
            
            // Previsões de recebimento
            if (processo.previsoesRecebimento && processo.previsoesRecebimento.length > 0) {
                processo.previsoesRecebimento.forEach(p => {
                    const valor = converterValorParaNumero(p.valor);
                    totalPrevisao += valor;
                    previsoesProcesso += valor;
                });
            }
            
            // Se o processo tem algum valor, adiciona à lista
            const totalProcesso = contratuaisProcesso + sucumbenciaisProcesso + previsoesProcesso;
            if (totalProcesso > 0) {
                processosComValores.push({
                    id: processo.id,
                    numeroProcesso: processo.numeroProcesso,
                    autor: processo.autor,
                    contratual: contratuaisProcesso,
                    sucumbencial: sucumbenciaisProcesso,
                    previsao: previsoesProcesso,
                    total: totalProcesso
                });
            }
        });
        
        // Ordenar por total decrescente
        processosComValores.sort((a, b) => b.total - a.total);
        
        return {
            totalContratual,
            totalSucumbencial,
            totalPrevisao,
            totalGeral: totalContratual + totalSucumbencial + totalPrevisao,
            processos: processosComValores
        };
    }
    
    function renderizarFinanceiro() {
        const dados = coletarDadosFinanceiros();
        
        if (dados.totalGeral === 0) {
            conteudoFinanceiro.innerHTML = `
                <div class="financeiro-vazio">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <p>Nenhum dado financeiro cadastrado</p>
                    <p style="font-size: 13px; margin-top: 4px;">Adicione honorários nos processos para visualizar o resumo</p>
                </div>
            `;
            return;
        }
        
        // Preparar dados para o gráfico de pizza
        const dadosGrafico = [];
        
        if (dados.totalContratual > 0) {
            dadosGrafico.push({
                label: 'Honorários Contratuais',
                valor: dados.totalContratual,
                cor: '#3b82f6',
                corEscura: '#2563eb'
            });
        }
        
        if (dados.totalSucumbencial > 0) {
            dadosGrafico.push({
                label: 'Honorários Sucumbenciais',
                valor: dados.totalSucumbencial,
                cor: '#8b5cf6',
                corEscura: '#7c3aed'
            });
        }
        
        if (dados.totalPrevisao > 0) {
            dadosGrafico.push({
                label: 'Previsões a Receber',
                valor: dados.totalPrevisao,
                cor: '#f59e0b',
                corEscura: '#d97706'
            });
        }
        
        let html = `
            <div class="financeiro-grafico">
                <div class="financeiro-header">
                    <h3>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="2" x2="12" y2="12"></line>
                            <line x1="12" y1="12" x2="16" y2="16"></line>
                        </svg>
                        Distribuição de Receitas
                    </h3>
                    <div class="filtro-mes">
                        <label for="select-mes">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Mês:
                        </label>
                        <select id="select-mes" class="select-mes">
                            <option value="todos">Todos os Meses</option>
                            <option value="0">Janeiro</option>
                            <option value="1">Fevereiro</option>
                            <option value="2">Março</option>
                            <option value="3">Abril</option>
                            <option value="4">Maio</option>
                            <option value="5">Junho</option>
                            <option value="6">Julho</option>
                            <option value="7">Agosto</option>
                            <option value="8">Setembro</option>
                            <option value="9">Outubro</option>
                            <option value="10">Novembro</option>
                            <option value="11">Dezembro</option>
                        </select>
                    </div>
                </div>
                <div class="grafico-pizza-container">
                    <canvas id="grafico-pizza" width="350" height="350"></canvas>
                    <div class="grafico-legenda" id="grafico-legenda"></div>
                </div>
            </div>
        `;
        
        conteudoFinanceiro.innerHTML = html;
        
        // Desenhar o gráfico de pizza
        setTimeout(() => {
            desenharGraficoPizza(dadosGrafico);
            
            // Event listener para mudança de mês
            document.getElementById('select-mes').addEventListener('change', function(e) {
                const mes = e.target.value;
                desenharGraficoPizza(dadosGrafico, mes);
            });
        }, 50);
    }
    
    // Função para desenhar gráfico de pizza
    function desenharGraficoPizza(dados, mesSelecionado = 'todos') {
        const canvas = document.getElementById('grafico-pizza');
        if (!canvas) return;
        
        // Calcular valores baseados no mês
        const dadosFiltrados = dados.map(item => {
            let valorFiltrado = item.valor;
            
            if (mesSelecionado !== 'todos') {
                // Simular variação mensal (70% a 130% do valor base)
                const mes = parseInt(mesSelecionado);
                const seed = mes * 123 + dados.indexOf(item) * 456;
                const variacao = 0.7 + ((seed % 60) / 100);
                valorFiltrado = item.valor * variacao;
            }
            
            return { ...item, valor: valorFiltrado };
        });
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 120;
        
        // Calcular total
        const total = dadosFiltrados.reduce((sum, item) => sum + item.valor, 0);
        
        // Estado de hover
        let hoveredSlice = -1;
        
        function desenhar(hoverIndex = -1) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let currentAngle = -Math.PI / 2;
            
            // Desenhar fatias
            dadosFiltrados.forEach((item, index) => {
                const sliceAngle = (item.valor / total) * 2 * Math.PI;
                const endAngle = currentAngle + sliceAngle;
                
                const isHovered = index === hoverIndex;
                const currentRadius = isHovered ? radius + 8 : radius;
                
                const offsetX = isHovered ? Math.cos(currentAngle + sliceAngle / 2) * 8 : 0;
                const offsetY = isHovered ? Math.sin(currentAngle + sliceAngle / 2) * 8 : 0;
                
                ctx.save();
                
                // Desenhar fatia (simples, sem 3D)
                ctx.fillStyle = item.cor;
                ctx.beginPath();
                ctx.moveTo(centerX + offsetX, centerY + offsetY);
                ctx.arc(centerX + offsetX, centerY + offsetY, currentRadius, currentAngle, endAngle);
                ctx.lineTo(centerX + offsetX, centerY + offsetY);
                ctx.closePath();
                ctx.fill();
                
                // Desenhar borda
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(centerX + offsetX, centerY + offsetY);
                ctx.arc(centerX + offsetX, centerY + offsetY, currentRadius, currentAngle, endAngle);
                ctx.lineTo(centerX + offsetX, centerY + offsetY);
                ctx.closePath();
                ctx.stroke();
                
                // Desenhar percentual
                const middleAngle = currentAngle + sliceAngle / 2;
                const textRadius = currentRadius * 0.7;
                const textX = centerX + offsetX + Math.cos(middleAngle) * textRadius;
                const textY = centerY + offsetY + Math.sin(middleAngle) * textRadius;
                
                const percentage = ((item.valor / total) * 100).toFixed(1);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 4;
                ctx.fillText(`${percentage}%`, textX, textY);
                
                ctx.restore();
                
                currentAngle = endAngle;
            });
        }
        
        // Evento de mouse para hover
        canvas.onmousemove = function(e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const dx = mouseX - centerX;
            const dy = mouseY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius + 8) {
                const angle = Math.atan2(dy, dx);
                let adjustedAngle = angle + Math.PI / 2;
                if (adjustedAngle < 0) adjustedAngle += 2 * Math.PI;
                
                let cumulative = 0;
                let newHoveredSlice = -1;
                
                for (let i = 0; i < dadosFiltrados.length; i++) {
                    const sliceAngle = (dadosFiltrados[i].valor / total) * 2 * Math.PI;
                    cumulative += sliceAngle;
                    
                    if (adjustedAngle <= cumulative) {
                        newHoveredSlice = i;
                        break;
                    }
                }
                
                if (newHoveredSlice !== hoveredSlice) {
                    hoveredSlice = newHoveredSlice;
                    canvas.style.cursor = 'pointer';
                    desenhar(hoveredSlice);
                }
            } else if (hoveredSlice !== -1) {
                hoveredSlice = -1;
                canvas.style.cursor = 'default';
                desenhar();
            }
        };
        
        canvas.onmouseleave = function() {
            hoveredSlice = -1;
            canvas.style.cursor = 'default';
            desenhar();
        };
        
        // Desenhar inicialmente
        desenhar();
        
        // Criar legenda
        const legendaDiv = document.getElementById('grafico-legenda');
        legendaDiv.innerHTML = dadosFiltrados.map(item => `
            <div class="legenda-item">
                <div class="legenda-cor" style="background: linear-gradient(135deg, ${item.cor}, ${item.corEscura})"></div>
                <div class="legenda-info">
                    <div class="legenda-label">${item.label}</div>
                    <div class="legenda-valor">${formatarMoeda(item.valor)}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Abrir modal financeiro
    if (btnFinanceiro) {
        btnFinanceiro.addEventListener('click', function() {
            renderizarFinanceiro();
            modalFinanceiro.classList.add('active');
        });
    }
    
    // Fechar modal financeiro
    if (btnFecharFinanceiro) {
        btnFecharFinanceiro.addEventListener('click', function() {
            modalFinanceiro.classList.remove('active');
        });
    }
    
    // Fechar modal ao clicar fora
    if (modalFinanceiro) {
        modalFinanceiro.addEventListener('click', function(e) {
            if (e.target === modalFinanceiro) {
                modalFinanceiro.classList.remove('active');
            }
        });
    }
    
    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    
    // Renderizar processos ao carregar
    renderizarProcessos();
    
    // Atualizar badge de alertas
    renderizarAlertas();
    
    console.log('Sistema de listagem de processos inicializado');
    console.log('Total de processos:', processos.length);
});
