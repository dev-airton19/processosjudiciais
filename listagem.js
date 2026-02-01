document.addEventListener('DOMContentLoaded', function() {
    
    // --- Referências DOM ---
    const tableBody = document.getElementById('table-processos');
    const totalProcessosSpan = document.getElementById('total-processos');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const filterSituacao = document.getElementById('filter-situacao');
    
    // Financeiro DOM
    const selectPeriodo = document.getElementById('select-periodo');
    const displayDatas = document.getElementById('display-datas');
    const modalDatas = document.getElementById('modal-datas');
    const btnFecharDatas = document.getElementById('btn-fechar-datas');
    const btnAplicarDatas = document.getElementById('btn-aplicar-datas');
    const inputInicio = document.getElementById('data-inicio');
    const inputFim = document.getElementById('data-fim');

    // Variáveis de Estado Financeiro
    let periodoFiltro = { inicio: null, fim: null, tipo: 'mes-atual' };

    // --- 1. Carregamento de Dados ---
    let processos = JSON.parse(localStorage.getItem('processos')) || [];

    // Função para criar dados de exemplo com alertas
    function criarDadosExemplo() {
        const hoje = new Date();
        const exemplos = [
            {
                id: 1,
                numeroProcesso: "2025-001234-5",
                autor: "Maria Silva Santos",
                situacaoAtual: "Em andamento",
                dataProximoEvento: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 5).toISOString().split('T')[0], // VENCIDO HÁ 5 DIAS
                honorariosContratuais: [{valor: "R$ 5.000,00", data: "2026-02-10"}],
                honorariosSucumbenciais: [],
                previsoesRecebimento: []
            },
            {
                id: 2,
                numeroProcesso: "2025-002567-8",
                autor: "Empresa XYZ Ltda",
                situacaoAtual: "Aguardando julgamento",
                dataProximoEvento: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 3).toISOString().split('T')[0], // VENCE EM 3 DIAS
                honorariosContratuais: [],
                honorariosSucumbenciais: [{valor: "R$ 15.000,00", data: "2026-02-15"}],
                previsoesRecebimento: [{valor: "R$ 20.000,00", dataPrevista: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString().split('T')[0]}]
            },
            {
                id: 3,
                numeroProcesso: "2025-003890-1",
                autor: "João da Silva Pereira",
                situacaoAtual: "Sentenciado",
                dataProximoEvento: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString().split('T')[0], // VENCE EM 1 DIA
                honorariosContratuais: [{valor: "R$ 2.500,00", data: "2026-01-20"}],
                honorariosSucumbenciais: [{valor: "R$ 8.000,00", data: "2026-02-05"}],
                previsoesRecebimento: []
            },
            {
                id: 4,
                numeroProcesso: "2025-004123-9",
                autor: "Carlos Alberto Costa",
                situacaoAtual: "Em andamento",
                dataProximoEvento: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 15).toISOString().split('T')[0], // SEM ALERTA
                honorariosContratuais: [{valor: "R$ 3.500,00", data: "2026-02-01"}],
                honorariosSucumbenciais: [],
                previsoesRecebimento: []
            }
        ];
        
        return exemplos;
    }

    // Se não houver processos salvos, carregar exemplos
    if (processos.length === 0) {
        processos = criarDadosExemplo();
        localStorage.setItem('processos', JSON.stringify(processos));
    }

    // Se não tiver dados reais, usar Mock Data APENAS para o financeiro visual
    function getDadosParaRelatorio() {
        // Se houver processos reais com valores, usa eles. Senão, usa fake.
        const temValores = processos.some(p => (p.honorariosContratuais?.length || p.honorariosSucumbenciais?.length));
        
        if (processos.length > 0 && temValores) return processos;

        // Mock Data (Dados Fictícios para Visualização)
        return [
            { id: 1, numeroProcesso: "001-MOCK", autor: "Cliente Exemplo 1", honorariosContratuais: [{valor: "R$ 5.000,00", data: "2026-02-10"}], honorariosSucumbenciais: [] },
            { id: 2, numeroProcesso: "002-MOCK", autor: "Empresa Teste SA", honorariosContratuais: [], honorariosSucumbenciais: [{valor: "R$ 15.000,00", data: "2026-02-15"}] },
            { id: 3, numeroProcesso: "003-MOCK", autor: "João da Silva", honorariosContratuais: [{valor: "R$ 2.500,00", data: "2026-01-20"}], previsoesRecebimento: [{valor: "R$ 10.000,00", dataPrevista: "2026-03-10"}] }
        ];
    }

    // --- 2. Renderizar Tabela de Processos (Estilo Original Restaurado) ---
    function renderizarProcessos() {
        const termo = searchInput.value.toLowerCase();
        const situacaoFiltro = filterSituacao.value;
        
        tableBody.innerHTML = '';
        
        // Filtra processos REAIS da lista
        const processosFiltrados = processos.filter(p => {
            const matchTexto = (p.autor && p.autor.toLowerCase().includes(termo)) || 
                               (p.numeroProcesso && p.numeroProcesso.includes(termo));
            const matchSituacao = situacaoFiltro ? p.situacaoAtual === situacaoFiltro : true;
            return matchTexto && matchSituacao;
        });

        totalProcessosSpan.textContent = processosFiltrados.length;

        if (processosFiltrados.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="empty-message">Nenhum processo encontrado.</td></tr>`;
            return;
        }

        processosFiltrados.forEach(p => {
            // Define classe do badge baseado no status
            let badgeClass = 'status-default';
            if (p.situacaoAtual === 'Em andamento') badgeClass = 'status-blue'; // Exemplo, ajuste conforme seu CSS
            if (p.situacaoAtual === 'Sentenciado') badgeClass = 'status-green';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="td-numero">${p.numeroProcesso}</td>
                <td class="td-autor">${p.autor}</td>
                <td class="td-situacao"><span class="badge-situacao" data-status="${p.situacaoAtual || 'Ativo'}">${p.situacaoAtual || 'Ativo'}</span></td>
                <td class="td-actions">
                    <button class="btn-action btn-view" onclick="editarProcesso(${p.id})">Editar</button>
                    <button class="btn-action btn-delete" onclick="excluirProcesso(${p.id})">Deletar</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- 3. Lógica de Alertas e Prazos ---
    
    function gerarAlertas() {
        const alertas = [];
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        processos.forEach(proc => {
            // Alerta para processos próximos de vencer
            if (proc.dataProximoEvento) {
                const dataEvento = new Date(proc.dataProximoEvento);
                dataEvento.setHours(0, 0, 0, 0);
                const diasRestantes = Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));
                
                if (diasRestantes > 0 && diasRestantes <= 7) {
                    alertas.push({
                        tipo: 'alerta',
                        processo: proc.numeroProcesso,
                        cliente: proc.autor,
                        mensagem: `Prazo próximo - ${diasRestantes} dia(s) restante(s)`,
                        data: proc.dataProximoEvento
                    });
                } else if (diasRestantes <= 0) {
                    alertas.push({
                        tipo: 'urgente',
                        processo: proc.numeroProcesso,
                        cliente: proc.autor,
                        mensagem: 'PRAZO VENCIDO!',
                        data: proc.dataProximoEvento
                    });
                }
            }
            
            // Alerta para previsões de recebimento
            (proc.previsoesRecebimento || []).forEach(prev => {
                const dataPrev = new Date(prev.dataPrevista || prev.data);
                dataPrev.setHours(0, 0, 0, 0);
                const diasRestantes = Math.ceil((dataPrev - hoje) / (1000 * 60 * 60 * 24));
                
                if (diasRestantes === 0) {
                    alertas.push({
                        tipo: 'info',
                        processo: proc.numeroProcesso,
                        cliente: proc.autor,
                        mensagem: `Previsão de recebimento: ${prev.valor}`,
                        data: prev.dataPrevista || prev.data
                    });
                }
            });
        });
        
        return alertas;
    }

    function atualizarBadgeAlertas() {
        const alertas = gerarAlertas();
        const badge = document.getElementById('badge-alertas');
        const btnAlertas = document.getElementById('btn-alertas');
        
        if (alertas.length > 0) {
            badge.textContent = alertas.length;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
        
        // Atualizar alertas em destaque na página
        atualizarAlertasDestaque(alertas);
    }

    function atualizarAlertasDestaque(alertas) {
        const container = document.getElementById('alertas-destaque');
        
        if (alertas.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = '<div style="display: grid; gap: 12px;">';
        
        alertas.forEach(alerta => {
            let bgColor = '#eff6ff';
            let borderColor = '#7dd3fc';
            let textColor = '#0c4a6e';
            let icone = 'ℹ️';
            
            if (alerta.tipo === 'urgente') {
                bgColor = '#fef2f2';
                borderColor = '#fecaca';
                textColor = '#7f1d1d';
                icone = '⚠️';
            } else if (alerta.tipo === 'alerta') {
                bgColor = '#fef3c7';
                borderColor = '#fde68a';
                textColor = '#78350f';
                icone = '🔔';
            } else if (alerta.tipo === 'info') {
                bgColor = '#d1fae5';
                borderColor = '#a7f3d0';
                textColor = '#065f46';
                icone = '✓';
            }
            
            html += `
                <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 15px; border-radius: 8px; color: ${textColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: 700; margin-bottom: 5px; font-size: 15px;">${icone} ${alerta.processo} - ${alerta.cliente}</div>
                            <div style="font-size: 14px; margin-bottom: 5px;">${alerta.mensagem}</div>
                            <div style="font-size: 12px; opacity: 0.8;">📅 ${new Date(alerta.data).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <button onclick="this.closest('div').style.display='none'" style="background: none; border: none; font-size: 16px; cursor: pointer; opacity: 0.6;">×</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    document.getElementById('btn-alertas').addEventListener('click', () => {
        const alertas = gerarAlertas();
        const modalAlertas = document.getElementById('modal-alertas');
        const listaAlertas = document.getElementById('lista-alertas');
        
        if (alertas.length === 0) {
            listaAlertas.innerHTML = '<div style="padding: 20px; text-align: center; color: #10b981; font-weight: 600;">✓ Nenhum alerta no momento</div>';
        } else {
            listaAlertas.innerHTML = alertas.map(alerta => {
                let bgColor = '#eff6ff';
                let borderColor = '#7dd3fc';
                let textColor = '#0c4a6e';
                
                if (alerta.tipo === 'urgente') {
                    bgColor = '#fef2f2';
                    borderColor = '#fecaca';
                    textColor = '#7f1d1d';
                } else if (alerta.tipo === 'alerta') {
                    bgColor = '#fef3c7';
                    borderColor = '#fde68a';
                    textColor = '#78350f';
                } else if (alerta.tipo === 'info') {
                    bgColor = '#d1fae5';
                    borderColor = '#a7f3d0';
                    textColor = '#065f46';
                }
                
                return `
                    <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 15px; margin-bottom: 10px; border-radius: 6px; color: ${textColor};">
                        <div style="font-weight: 600; margin-bottom: 5px;">${alerta.processo} - ${alerta.cliente}</div>
                        <div style="font-size: 14px;">${alerta.mensagem}</div>
                        <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">Data: ${new Date(alerta.data).toLocaleDateString('pt-BR')}</div>
                    </div>
                `;
            }).join('');
        }
        
        modalAlertas.style.display = 'flex';
    });

    document.getElementById('btn-fechar-alertas').addEventListener('click', () => {
        document.getElementById('modal-alertas').style.display = 'none';
    });

    // --- 4. Lógica Financeira ---
    
    function parseMoney(str) {
        if(!str) return 0;
        if(typeof str === 'number') return str;
        return parseFloat(str.replace('R$','').replace(/\./g,'').replace(',','.').trim()) || 0;
    }

    function formatMoney(val) {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function dataNoIntervalo(dataStr) {
        if (!periodoFiltro.inicio || !periodoFiltro.fim) return true; // Se não tem filtro, aceita tudo (ou trata logica de mes atual)
        
        // Trata formatos DD/MM/AAAA ou AAAA-MM-DD
        let dataObj;
        if (dataStr.includes('/')) {
            const parts = dataStr.split('/');
            dataObj = new Date(parts[2], parts[1]-1, parts[0]);
        } else {
            dataObj = new Date(dataStr);
        }
        
        return dataObj >= periodoFiltro.inicio && dataObj <= periodoFiltro.fim;
    }

    function calcularTotais() {
        const dados = getDadosParaRelatorio();
        let totalC = 0, totalS = 0, totalP = 0;

        dados.forEach(proc => {
            // Contratuais
            (proc.honorariosContratuais || []).forEach(h => {
                if(dataNoIntervalo(h.data)) totalC += parseMoney(h.valor);
            });
            // Sucumbenciais
            (proc.honorariosSucumbenciais || []).forEach(h => {
                if(dataNoIntervalo(h.data)) totalS += parseMoney(h.valor);
            });
            // Previsão
            (proc.previsoesRecebimento || []).forEach(h => {
                if(dataNoIntervalo(h.dataPrevista || h.data)) totalP += parseMoney(h.valor);
            });
        });

        document.getElementById('val-contratual').textContent = formatMoney(totalC);
        document.getElementById('val-sucumbencial').textContent = formatMoney(totalS);
        document.getElementById('val-previsao').textContent = formatMoney(totalP);
        
        return { c: totalC, s: totalS, p: totalP };
    }

    // --- 4. Controle de Datas (Lógica Solicitada) ---
    
    function atualizarPeriodo() {
        const val = selectPeriodo.value;
        const hoje = new Date();

        if (val === 'mes-atual') {
            periodoFiltro.inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            periodoFiltro.fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            displayDatas.style.display = 'none';
            calcularTotais();
        } 
        else if (val === 'tudo') {
            periodoFiltro.inicio = null;
            periodoFiltro.fim = null;
            displayDatas.style.display = 'none';
            calcularTotais();
        }
        else if (val === 'personalizado') {
            modalDatas.style.display = 'flex';
        }
    }

    selectPeriodo.addEventListener('change', atualizarPeriodo);
    
    btnFecharDatas.addEventListener('click', () => {
        modalDatas.style.display = 'none';
        selectPeriodo.value = 'mes-atual'; // Reseta se cancelar
        atualizarPeriodo();
    });

    btnAplicarDatas.addEventListener('click', () => {
        if(!inputInicio.value || !inputFim.value) {
            alert('Selecione as duas datas.');
            return;
        }
        periodoFiltro.inicio = new Date(inputInicio.value);
        periodoFiltro.fim = new Date(inputFim.value);
        
        // Ajuste fuso/horario fim do dia
        periodoFiltro.inicio.setHours(0,0,0,0);
        periodoFiltro.fim.setHours(23,59,59,999);

        displayDatas.textContent = `${inputInicio.value.split('-').reverse().join('/')} até ${inputFim.value.split('-').reverse().join('/')}`;
        displayDatas.style.display = 'inline';
        
        modalDatas.style.display = 'none';
        calcularTotais();
    });

    // --- 5. Botões de Exportação ---

    document.getElementById('btn-pdf').addEventListener('click', () => {
        gerarPDF();
    });

    function gerarPDF() {
        const totais = calcularTotais();
        const dados = getDadosParaRelatorio();
        const hoje = new Date();
        const dataAtual = hoje.toLocaleDateString('pt-BR');

        // HTML do relatório para PDF
        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: white;
                        color: #333;
                        line-height: 1.6;
                    }
                    .header { 
                        background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                        color: white;
                        padding: 40px 30px;
                        margin-bottom: 30px;
                        text-align: center;
                        border-radius: 8px;
                    }
                    .header h1 { 
                        font-size: 28px;
                        margin-bottom: 10px;
                        font-weight: 700;
                    }
                    .header .subtitle {
                        font-size: 16px;
                        opacity: 0.95;
                        margin-bottom: 5px;
                    }
                    .header .data {
                        font-size: 13px;
                        opacity: 0.8;
                    }
                    .section { 
                        margin-bottom: 35px;
                        padding: 0 0;
                    }
                    .section h2 { 
                        color: #1f2937;
                        font-size: 16px;
                        font-weight: 700;
                        border-bottom: 3px solid #3b82f6;
                        padding-bottom: 12px;
                        margin-bottom: 20px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .financeiro-cards { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr 1fr; 
                        gap: 15px; 
                        margin-bottom: 25px;
                    }
                    .card { 
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 5px solid #3b82f6;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                        transition: transform 0.2s;
                    }
                    .card:hover {
                        transform: translateY(-2px);
                    }
                    .card.sucumbencial { 
                        border-left-color: #10b981;
                    }
                    .card.previsao { 
                        border-left-color: #f59e0b;
                    }
                    .card-label { 
                        font-size: 11px; 
                        color: #9ca3af; 
                        text-transform: uppercase; 
                        font-weight: 700;
                        letter-spacing: 0.5px;
                        margin-bottom: 8px;
                    }
                    .card-value { 
                        font-size: 26px; 
                        color: #1f2937; 
                        font-weight: 700;
                    }
                    .resumo {
                        background: #f9fafb;
                        padding: 20px;
                        border-radius: 8px;
                        margin-top: 20px;
                    }
                    .resumo-row { 
                        display: flex; 
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0; 
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .resumo-row:last-child {
                        border-bottom: none;
                    }
                    .resumo-row strong { 
                        color: #374151;
                        font-weight: 600;
                    }
                    .resumo-row .valor { 
                        font-weight: 700; 
                        color: #3b82f6;
                        font-size: 15px;
                    }
                    .resumo-row.total {
                        background: white;
                        padding: 16px 0;
                        border-top: 2px solid #3b82f6;
                        border-bottom: 2px solid #3b82f6;
                        margin-top: 15px;
                    }
                    .resumo-row.total strong {
                        font-size: 16px;
                        color: #1f2937;
                    }
                    .resumo-row.total .valor {
                        font-size: 20px;
                        color: #1f2937;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    thead { 
                        background: #1f2937;
                        color: white;
                    }
                    th { 
                        padding: 15px 12px;
                        text-align: left;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        font-size: 12px;
                        border-bottom: 2px solid #3b82f6;
                    }
                    td { 
                        padding: 12px;
                        border-bottom: 1px solid #e5e7eb;
                        font-size: 13px;
                    }
                    tbody tr:nth-child(odd) {
                        background: #f9fafb;
                    }
                    tbody tr:hover {
                        background: #f3f4f6;
                    }
                    tbody tr td:first-child {
                        font-weight: 700;
                        color: #3b82f6;
                    }
                    .rodape { 
                        margin-top: 40px; 
                        text-align: center; 
                        color: #9ca3af;
                        font-size: 11px;
                        border-top: 1px solid #e5e7eb;
                        padding-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Controle de Processos Judiciais</h1>
                    <div class="subtitle">Relatório Financeiro</div>
                    <div class="data">Gerado em ${dataAtual}</div>
                </div>

                <div class="section">
                    <h2>Resumo Financeiro</h2>
                    <div class="financeiro-cards">
                        <div class="card">
                            <div class="card-label">💰 Contratuais</div>
                            <div class="card-value">${formatMoney(totais.c)}</div>
                        </div>
                        <div class="card sucumbencial">
                            <div class="card-label">📈 Sucumbenciais</div>
                            <div class="card-value">${formatMoney(totais.s)}</div>
                        </div>
                        <div class="card previsao">
                            <div class="card-label">📅 Previsão</div>
                            <div class="card-value">${formatMoney(totais.p)}</div>
                        </div>
                    </div>

                    <div class="resumo">
                        <div class="resumo-row">
                            <strong>Total Contratuais:</strong>
                            <span class="valor">${formatMoney(totais.c)}</span>
                        </div>
                        <div class="resumo-row">
                            <strong>Total Sucumbenciais:</strong>
                            <span class="valor">${formatMoney(totais.s)}</span>
                        </div>
                        <div class="resumo-row">
                            <strong>Total em Previsão:</strong>
                            <span class="valor">${formatMoney(totais.p)}</span>
                        </div>
                        <div class="resumo-row total">
                            <strong>TOTAL GERAL:</strong>
                            <span class="valor">${formatMoney(totais.c + totais.s + totais.p)}</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>Detalhamento por Processo</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Número do Processo</th>
                                <th>Cliente</th>
                                <th>Contratuais</th>
                                <th>Sucumbenciais</th>
                                <th>Previsão</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dados.map(proc => {
                                let contratual = 0, sucumbencial = 0, previsao = 0;
                                (proc.honorariosContratuais || []).forEach(h => {
                                    if(dataNoIntervalo(h.data)) contratual += parseMoney(h.valor);
                                });
                                (proc.honorariosSucumbenciais || []).forEach(h => {
                                    if(dataNoIntervalo(h.data)) sucumbencial += parseMoney(h.valor);
                                });
                                (proc.previsoesRecebimento || []).forEach(h => {
                                    if(dataNoIntervalo(h.dataPrevista || h.data)) previsao += parseMoney(h.valor);
                                });
                                return `
                                    <tr>
                                        <td>${proc.numeroProcesso}</td>
                                        <td>${proc.autor}</td>
                                        <td>${formatMoney(contratual)}</td>
                                        <td>${formatMoney(sucumbencial)}</td>
                                        <td>${formatMoney(previsao)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="rodape">
                    <p>Este documento foi gerado automaticamente pelo <strong>Sistema de Controle de Processos Judiciais</strong></p>
                    <p style="margin-top: 5px;">Período: <strong>${periodoFiltro.inicio ? periodoFiltro.inicio.toLocaleDateString('pt-BR') + ' a ' + periodoFiltro.fim.toLocaleDateString('pt-BR') : 'Todo o período'}</strong></p>
                </div>
            </body>
            </html>
        `;

        // Usar html2pdf para gerar o PDF
        const element = document.createElement('div');
        element.innerHTML = html;

        const opt = {
            margin: 12,
            filename: `relatorio_financeiro_${hoje.toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        html2pdf().set(opt).from(element).save();
    }

    document.getElementById('btn-excel').addEventListener('click', () => {
        let csv = "Tipo;Valor\n";
        const totais = calcularTotais();
        csv += `Contratuais;${totais.c}\n`;
        csv += `Sucumbenciais;${totais.s}\n`;
        csv += `Previsão;${totais.p}\n`;
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio_financeiro.csv';
        a.click();
    });

    document.getElementById('btn-grafico').addEventListener('click', () => {
        const totais = calcularTotais();
        const container = document.getElementById('modal-grafico-container');
        
        // Determinar texto do período
        let textoPeriodo = 'Mês Atual';
        if (periodoFiltro.inicio && periodoFiltro.fim) {
            textoPeriodo = `${periodoFiltro.inicio.toLocaleDateString('pt-BR')} a ${periodoFiltro.fim.toLocaleDateString('pt-BR')}`;
        }
        
        container.innerHTML = `
            <div class="modal-alertas" style="display: flex;">
                <div class="modal-alertas-content" style="width: 600px; max-width: 90%;">
                    <div class="modal-alertas-header">
                        <div>
                            <h2>Gráfico Financeiro</h2>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Período: ${textoPeriodo}</p>
                        </div>
                        <button onclick="this.closest('.modal-alertas').remove()" class="btn-fechar-modal">X</button>
                    </div>
                    <div class="modal-alertas-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center;">
                        <div>
                            <canvas id="chartFinanceiro"></canvas>
                        </div>
                        <div style="padding: 20px;">
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 12px; color: #999; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Contratuais</div>
                                <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${formatMoney(totais.c)}</div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 12px; color: #999; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Sucumbenciais</div>
                                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${formatMoney(totais.s)}</div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 12px; color: #999; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Previsão</div>
                                <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${formatMoney(totais.p)}</div>
                            </div>
                            <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
                                <div style="font-size: 12px; color: #999; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">TOTAL</div>
                                <div style="font-size: 28px; font-weight: bold; color: #1f2937;">${formatMoney(totais.c + totais.s + totais.p)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Usar setTimeout para garantir que o elemento existe antes de acessá-lo
        setTimeout(() => {
            const ctx = document.getElementById('chartFinanceiro');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Contratuais', 'Sucumbenciais', 'Previsão'],
                        datasets: [{
                            data: [totais.c, totais.s, totais.p],
                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                            borderColor: ['#1e40af', '#047857', '#d97706'],
                            borderWidth: 2,
                            hoverBorderWidth: 3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    font: { size: 12, weight: 'bold' },
                                    padding: 15,
                                    usePointStyle: true
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = formatMoney(context.parsed);
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }, 100);
    });

    // Funções Globais (para o HTML chamar)
    window.excluirProcesso = function(id) {
        if(confirm('Deseja excluir?')) {
            processos = processos.filter(p => p.id !== id);
            localStorage.setItem('processos', JSON.stringify(processos));
            renderizarProcessos();
            calcularTotais();
        }
    };
    
    window.editarProcesso = function(id) {
        localStorage.setItem('processoEditando', id);
        window.location.href = 'cadastro.html'; // Assume que existe
    };

    // Listeners da Lista
    searchInput.addEventListener('input', () => {
        clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
        renderizarProcessos();
    });
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        renderizarProcessos();
        clearSearchBtn.style.display = 'none';
    });

    filterSituacao.addEventListener('change', renderizarProcessos);
    
    document.getElementById('btn-novo-processo').addEventListener('click', () => {
        localStorage.removeItem('processoEditando');
        window.location.href = 'cadastro.html'; 
    });

    // Botão Sair
    document.getElementById('btn-sair').addEventListener('click', (e) => {
        e.preventDefault();
        if(confirm('Sair do sistema?')) window.location.href = 'login.html';
    });

    // Inicialização
    renderizarProcessos();
    atualizarPeriodo(); // Inicia calculando mes atual
    atualizarBadgeAlertas(); // Atualiza badge de alertas
});