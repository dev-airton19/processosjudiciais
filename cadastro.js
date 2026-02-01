// ========================================
// SISTEMA DE CADASTRO DE NOVO PROCESSO
// ========================================

// Verificar autenticação antes de carregar
(function verificarAutenticacao() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }
})();

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
    // ACOMPANHAMENTO: ESTADO LOCAL
    // ========================================
    let andamentos = [];
    let prazos = [];
    let providencias = [];
    let honorariosContratuais = [];
    let honorariosSucumbenciais = [];
    let previsoesRecebimento = [];

    function converterValorParaNumero(valorString) {
        if (!valorString) return 0;
        return parseFloat(valorString.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
    }

    // ========================================
    // RENDERIZAÇÃO: ANDAMENTOS
    // ========================================
    function renderizarAndamentos() {
        const tbody = document.getElementById('table-andamentos');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (andamentos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#6b7280;padding:40px;">Nenhum andamento cadastrado</td></tr>`;
            return;
        }
        andamentos.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${a.data}</td>
                <td>${a.descricao}</td>
                <td>${a.responsavel || '-'}</td>
                <td>
                    <button class="btn-action btn-edit-andamento" data-id="${a.id}">Editar</button>
                    <button class="btn-action btn-delete-andamento" data-id="${a.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        document.querySelectorAll('.btn-delete-andamento').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                andamentos = andamentos.filter(x => x.id !== id);
                renderizarAndamentos();
            });
        });
        document.querySelectorAll('.btn-edit-andamento').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const a = andamentos.find(x => x.id === id);
                if (!a) return;
                document.getElementById('andamento-data').value = a.data.split('/').reverse().join('-');
                document.getElementById('andamento-descricao').value = a.descricao;
                document.getElementById('andamento-responsavel').value = a.responsavel || '';
                modalAndamento.classList.add('active');
                andamentoEditandoId = id;
            });
        });
    }

    // ========================================
    // RENDERIZAÇÃO: PRAZOS
    // ========================================
    function calcularDiasRestantes(dataLimite) {
        const hoje = new Date(); hoje.setHours(0,0,0,0);
        const [d,m,a] = dataLimite.split('/');
        const dt = new Date(a, m-1, d); dt.setHours(0,0,0,0);
        return Math.ceil((dt - hoje) / (1000*60*60*24));
    }
    function renderizarPrazos() {
        const tbody = document.getElementById('table-prazos');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (prazos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#6b7280;">Nenhum prazo cadastrado</td></tr>`;
            return;
        }
        prazos.forEach(p => {
            const dias = calcularDiasRestantes(p.dataLimite);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.descricao}</td>
                <td>${p.dataLimite}</td>
                <td>${dias < 0 ? 'Vencido' : dias + ' dias'}</td>
                <td>
                    <button class="btn-action btn-edit-prazo" data-id="${p.id}">Editar</button>
                    <button class="btn-action btn-delete-prazo" data-id="${p.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        document.querySelectorAll('.btn-delete-prazo').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                prazos = prazos.filter(x => x.id !== id);
                renderizarPrazos();
            });
        });
        document.querySelectorAll('.btn-edit-prazo').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const p = prazos.find(x => x.id === id);
                if (!p) return;
                document.getElementById('prazo-descricao').value = p.descricao;
                const [d,m,a] = p.dataLimite.split('/');
                document.getElementById('prazo-data').value = `${a}-${m}-${d}`;
                modalPrazo.classList.add('active');
                prazoEditandoId = id;
            });
        });
    }

    // ========================================
    // RENDERIZAÇÃO: PROVIDÊNCIAS
    // ========================================
    function renderizarProvidencias() {
        const tbody = document.getElementById('table-providencias');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (providencias.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#6b7280;">Nenhuma providência cadastrada</td></tr>`;
            return;
        }
        providencias.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.tarefa}</td>
                <td>${p.responsavel}</td>
                <td>${p.status || '-'}</td>
                <td>
                    <button class="btn-action btn-edit-providencia" data-id="${p.id}">Editar</button>
                    <button class="btn-action btn-delete-providencia" data-id="${p.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        document.querySelectorAll('.btn-delete-providencia').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                providencias = providencias.filter(x => x.id !== id);
                renderizarProvidencias();
            });
        });
        document.querySelectorAll('.btn-edit-providencia').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const p = providencias.find(x => x.id === id);
                if (!p) return;
                document.getElementById('providencia-tarefa').value = p.tarefa;
                document.getElementById('providencia-responsavel').value = p.responsavel;
                modalProvidencia.classList.add('active');
                providenciaEditandoId = id;
            });
        });
    }

    // ========================================
    // RENDERIZAÇÃO: FINANCEIRO
    // ========================================
    function renderizarHonorariosContratuais() {
        const tbody = document.getElementById('table-honorarios-contratuais');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (honorariosContratuais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#6b7280;">Nenhum honorário cadastrado</td></tr>`;
            return;
        }
        honorariosContratuais.forEach(h => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${h.data}</td>
                <td>${h.descricao}</td>
                <td>R$ ${h.valor}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    function renderizarHonorariosSucumbenciais() {
        const tbody = document.getElementById('table-honorarios-sucumbenciais');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (honorariosSucumbenciais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#6b7280;">Nenhum honorário cadastrado</td></tr>`;
            return;
        }
        honorariosSucumbenciais.forEach(h => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${h.data}</td>
                <td>${h.fonte}</td>
                <td>R$ ${h.valor}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    function renderizarPrevisoes() {
        const tbody = document.getElementById('table-previsoes');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (previsoesRecebimento.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#6b7280;">Nenhuma previsão cadastrada</td></tr>`;
            return;
        }
        previsoesRecebimento.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.dataPrevista}</td>
                <td>${p.tipo}</td>
                <td>${p.descricao}</td>
                <td>R$ ${p.valor}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ========================================
    // MODAIS: AÇÕES
    // ========================================
    const btnAddAndamento = document.getElementById('btn-add-andamento');
    const modalAndamento = document.getElementById('modal-andamento');
    const btnFecharModalAndamento = document.getElementById('modal-close-andamento');
    const btnCancelarAndamento = document.getElementById('btn-cancelar-andamento');
    const btnSalvarAndamento = document.getElementById('btn-salvar-andamento');
    let andamentoEditandoId = null;
    if (btnAddAndamento) btnAddAndamento.addEventListener('click', ()=>{ andamentoEditandoId=null; document.getElementById('andamento-data').value=''; document.getElementById('andamento-descricao').value=''; document.getElementById('andamento-responsavel').value=''; modalAndamento.classList.add('active'); });
    if (btnFecharModalAndamento) btnFecharModalAndamento.addEventListener('click', ()=>{ modalAndamento.classList.remove('active'); andamentoEditandoId=null; });
    if (btnCancelarAndamento) btnCancelarAndamento.addEventListener('click', ()=>{ modalAndamento.classList.remove('active'); andamentoEditandoId=null; });
    if (btnSalvarAndamento) btnSalvarAndamento.addEventListener('click', ()=>{
        const dataISO = document.getElementById('andamento-data').value;
        const descricao = document.getElementById('andamento-descricao').value;
        const responsavel = document.getElementById('andamento-responsavel').value;
        if (!dataISO || !descricao) { alert('Preencha data e descrição.'); return; }
        const data = dataISO.split('-').reverse().join('/');
        if (andamentoEditandoId) {
            const a = andamentos.find(x=>x.id===andamentoEditandoId); if (a){ a.data=data; a.descricao=descricao; a.responsavel=responsavel; }
        } else {
            andamentos.push({ id: Date.now(), data, descricao, responsavel });
        }
        renderizarAndamentos(); modalAndamento.classList.remove('active');
    });

    const btnAddPrazo = document.getElementById('btn-add-prazo');
    const modalPrazo = document.getElementById('modal-prazo');
    const btnFecharModalPrazo = document.getElementById('modal-close-prazo');
    const btnCancelarPrazo = document.getElementById('btn-cancelar-prazo');
    const btnSalvarPrazo = document.getElementById('btn-salvar-prazo');
    let prazoEditandoId = null;
    if (btnAddPrazo) btnAddPrazo.addEventListener('click', ()=>{ prazoEditandoId=null; document.getElementById('prazo-descricao').value=''; document.getElementById('prazo-data').value=''; modalPrazo.classList.add('active'); });
    if (btnFecharModalPrazo) btnFecharModalPrazo.addEventListener('click', ()=>{ modalPrazo.classList.remove('active'); prazoEditandoId=null; });
    if (btnCancelarPrazo) btnCancelarPrazo.addEventListener('click', ()=>{ modalPrazo.classList.remove('active'); prazoEditandoId=null; });
    if (btnSalvarPrazo) btnSalvarPrazo.addEventListener('click', ()=>{
        const descricao = document.getElementById('prazo-descricao').value;
        const dataISO = document.getElementById('prazo-data').value;
        if (!descricao || !dataISO) { alert('Preencha descrição e data.'); return; }
        const dataLimite = dataISO.split('-').reverse().join('/');
        if (prazoEditandoId) { const p = prazos.find(x=>x.id===prazoEditandoId); if (p){ p.descricao=descricao; p.dataLimite=dataLimite; } }
        else { prazos.push({ id: Date.now(), descricao, dataLimite }); }
        renderizarPrazos(); modalPrazo.classList.remove('active');
    });

    const btnAddProvidencia = document.getElementById('btn-add-providencia');
    const modalProvidencia = document.getElementById('modal-providencia');
    const btnFecharModalProvidencia = document.getElementById('modal-close-providencia');
    const btnCancelarProvidencia = document.getElementById('btn-cancelar-providencia');
    const btnSalvarProvidencia = document.getElementById('btn-salvar-providencia');
    let providenciaEditandoId = null;
    if (btnAddProvidencia) btnAddProvidencia.addEventListener('click', ()=>{ providenciaEditandoId=null; document.getElementById('providencia-tarefa').value=''; document.getElementById('providencia-responsavel').value=''; modalProvidencia.classList.add('active'); });
    if (btnFecharModalProvidencia) btnFecharModalProvidencia.addEventListener('click', ()=>{ modalProvidencia.classList.remove('active'); providenciaEditandoId=null; });
    if (btnCancelarProvidencia) btnCancelarProvidencia.addEventListener('click', ()=>{ modalProvidencia.classList.remove('active'); providenciaEditandoId=null; });
    if (btnSalvarProvidencia) btnSalvarProvidencia.addEventListener('click', ()=>{
        const tarefa = document.getElementById('providencia-tarefa').value;
        const responsavel = document.getElementById('providencia-responsavel').value;
        if (!tarefa || !responsavel) { alert('Preencha tarefa e responsável.'); return; }
        if (providenciaEditandoId) { const p = providencias.find(x=>x.id===providenciaEditandoId); if (p){ p.tarefa=tarefa; p.responsavel=responsavel; } }
        else { providencias.push({ id: Date.now(), tarefa, responsavel, status: 'Pendente' }); }
        renderizarProvidencias(); modalProvidencia.classList.remove('active');
    });

    const btnAddHonContratual = document.getElementById('btn-add-honorario-contratual');
    const modalHonContratual = document.getElementById('modal-honorario-contratual');
    if (btnAddHonContratual) btnAddHonContratual.addEventListener('click', ()=>{ document.getElementById('hon-contratual-data').value=''; document.getElementById('hon-contratual-descricao').value=''; document.getElementById('hon-contratual-valor').value=''; modalHonContratual.classList.add('active'); });
    const btnFecharHonContratual = document.getElementById('modal-close-honorario-contratual');
    const btnCancelarHonContratual = document.getElementById('btn-cancelar-honorario-contratual');
    const btnSalvarHonContratual = document.getElementById('btn-salvar-honorario-contratual');
    if (btnFecharHonContratual) btnFecharHonContratual.addEventListener('click', ()=> modalHonContratual.classList.remove('active'));
    if (btnCancelarHonContratual) btnCancelarHonContratual.addEventListener('click', ()=> modalHonContratual.classList.remove('active'));
    if (btnSalvarHonContratual) btnSalvarHonContratual.addEventListener('click', ()=>{
        const dataISO = document.getElementById('hon-contratual-data').value;
        const descricao = document.getElementById('hon-contratual-descricao').value;
        const valor = document.getElementById('hon-contratual-valor').value;
        if (!dataISO || !descricao || !valor) { alert('Preencha todos os campos.'); return; }
        const data = dataISO.split('-').reverse().join('/');
        honorariosContratuais.push({ data, descricao, valor });
        renderizarHonorariosContratuais(); modalHonContratual.classList.remove('active');
    });

    const btnAddHonSuc = document.getElementById('btn-add-honorario-sucumbencial');
    const modalHonSuc = document.getElementById('modal-honorario-sucumbencial');
    if (btnAddHonSuc) btnAddHonSuc.addEventListener('click', ()=>{ document.getElementById('hon-sucumbencial-data').value=''; document.getElementById('hon-sucumbencial-fonte').value=''; document.getElementById('hon-sucumbencial-valor').value=''; modalHonSuc.classList.add('active'); });
    const btnFecharHonSuc = document.getElementById('modal-close-honorario-sucumbencial');
    const btnCancelarHonSuc = document.getElementById('btn-cancelar-honorario-sucumbencial');
    const btnSalvarHonSuc = document.getElementById('btn-salvar-honorario-sucumbencial');
    if (btnFecharHonSuc) btnFecharHonSuc.addEventListener('click', ()=> modalHonSuc.classList.remove('active'));
    if (btnCancelarHonSuc) btnCancelarHonSuc.addEventListener('click', ()=> modalHonSuc.classList.remove('active'));
    if (btnSalvarHonSuc) btnSalvarHonSuc.addEventListener('click', ()=>{
        const dataISO = document.getElementById('hon-sucumbencial-data').value;
        const fonte = document.getElementById('hon-sucumbencial-fonte').value;
        const valor = document.getElementById('hon-sucumbencial-valor').value;
        if (!dataISO || !fonte || !valor) { alert('Preencha todos os campos.'); return; }
        const data = dataISO.split('-').reverse().join('/');
        honorariosSucumbenciais.push({ data, fonte, valor });
        renderizarHonorariosSucumbenciais(); modalHonSuc.classList.remove('active');
    });

    const btnAddPrev = document.getElementById('btn-add-previsao');
    const modalPrev = document.getElementById('modal-previsao');
    if (btnAddPrev) btnAddPrev.addEventListener('click', ()=>{ document.getElementById('prev-data').value=''; document.getElementById('prev-tipo').value='Contratual'; document.getElementById('prev-descricao').value=''; document.getElementById('prev-valor').value=''; modalPrev.classList.add('active'); });
    const btnFecharPrev = document.getElementById('modal-close-previsao');
    const btnCancelarPrev = document.getElementById('btn-cancelar-previsao');
    const btnSalvarPrev = document.getElementById('btn-salvar-previsao');
    if (btnFecharPrev) btnFecharPrev.addEventListener('click', ()=> modalPrev.classList.remove('active'));
    if (btnCancelarPrev) btnCancelarPrev.addEventListener('click', ()=> modalPrev.classList.remove('active'));
    if (btnSalvarPrev) btnSalvarPrev.addEventListener('click', ()=>{
        const dataISO = document.getElementById('prev-data').value;
        const tipo = document.getElementById('prev-tipo').value;
        const descricao = document.getElementById('prev-descricao').value;
        const valor = document.getElementById('prev-valor').value;
        if (!dataISO || !tipo || !descricao || !valor) { alert('Preencha todos os campos.'); return; }
        const dataPrevista = dataISO.split('-').reverse().join('/');
        previsoesRecebimento.push({ dataPrevista, tipo, descricao, valor });
        renderizarPrevisoes(); modalPrev.classList.remove('active');
    });

    // ========================================
    // SUBMIT DO FORMULÁRIO DE CADASTRO
    // ========================================
    const formCadastroProcesso = document.getElementById('form-cadastro-processo');
    formCadastroProcesso.addEventListener('submit', function(e) {
        e.preventDefault();
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
            situacaoAtual: document.getElementById('situacao-atual').value,
            observacoesTecnicas: document.getElementById('observacoes-tecnicas').value || '',
            acompanhamentos: andamentos,
            prazos: prazos,
            providencias: providencias,
            honorariosContratuais: honorariosContratuais,
            honorariosSucumbenciais: honorariosSucumbenciais,
            previsoesRecebimento: previsoesRecebimento
        };
        let processos = JSON.parse(localStorage.getItem('processos')) || [];
        processos.push(novoProcesso);
        localStorage.setItem('processos', JSON.stringify(processos));
        alert(`Processo cadastrado com sucesso!\n\nNúmero: ${novoProcesso.numeroProcesso}\nAutor: ${novoProcesso.autor}`);
        window.location.href = 'dashboard.html';
    });

    // Inicial render
    renderizarAndamentos();
    renderizarPrazos();
    renderizarProvidencias();
    renderizarHonorariosContratuais();
    renderizarHonorariosSucumbenciais();
    renderizarPrevisoes();

    // ========================================
    // LOG DE INICIALIZAÇÃO
    // ========================================

    console.log('Sistema de cadastro de processo inicializado');
});
