const API_URL = 'http://localhost:8080/transacoes';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    carregarTransacoes();
    
    document.getElementById('transacao-form').addEventListener('submit', criarTransacao);
});

const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

async function carregarTransacoes() {
    const listContainer = document.getElementById('transacoes-list');
    listContainer.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar transações');
        
        const transacoes = await response.json();
        renderizarLista(transacoes);
    } catch (error) {
        console.error('Erro:', error);
        listContainer.innerHTML = `<div class="empty-state" style="color: var(--danger);">Falha ao carregar os dados. Verifique se o backend está rodando em ${API_URL}</div>`;
    }
}

function renderizarLista(transacoes) {
    const listContainer = document.getElementById('transacoes-list');
    listContainer.innerHTML = '';
    
    if (transacoes.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">Nenhuma transação registrada ainda.</div>';
        return;
    }
    
    transacoes.forEach(t => {
        const card = document.createElement('div');
        card.className = 'transacao-card';
        card.dataset.id = t.id;
        
        const isReceita = t.tipo === 'receita';
        const sinal = isReceita ? '+' : '-';
        
        card.innerHTML = `
            <div class="transacao-info">
                <div class="transacao-desc-display">
                    ${t.descricao}
                    <button class="btn-icon btn-edit" title="Editar descrição" onclick="iniciarEdicao(${t.id})">
                        <i data-lucide="edit-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
                
                <div class="transacao-desc-edit">
                    <input type="text" value="${t.descricao}" id="edit-input-${t.id}">
                    <button class="btn-icon btn-save-edit" title="Salvar" onclick="salvarEdicao(${t.id})">
                        <i data-lucide="check" style="width: 18px; height: 18px;"></i>
                    </button>
                    <button class="btn-icon" title="Cancelar" onclick="cancelarEdicao(${t.id})">
                        <i data-lucide="x" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
                
                <span class="transacao-badge ${t.tipo}">${t.tipo}</span>
            </div>
            
            <div class="transacao-amount ${t.tipo}">
                ${sinal} ${formatarMoeda(t.valor)}
                <button class="btn-icon" title="Deletar" onclick="deletarTransacao(${t.id})">
                    <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                </button>
            </div>
        `;
        
        listContainer.appendChild(card);
    });
    
    lucide.createIcons();
}

async function criarTransacao(event) {
    event.preventDefault();
    
    const descricao = document.getElementById('descricao').value;
    const valorStr = document.getElementById('valor').value;
    const tipo = document.getElementById('tipo').value;
    
    const novaTransacao = {
        descricao: descricao,
        valor: parseFloat(valorStr),
        tipo: tipo
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaTransacao)
        });
        
        if (!response.ok) throw new Error('Erro ao criar transação');
        
        document.getElementById('transacao-form').reset();
        await carregarTransacoes();
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Não foi possível criar a transação.');
    }
}

function iniciarEdicao(id) {
    const card = document.querySelector(`.transacao-card[data-id="${id}"]`);
    if (card) {
        card.classList.add('is-editing');
        const input = document.getElementById(`edit-input-${id}`);
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
}

function cancelarEdicao(id) {
    const card = document.querySelector(`.transacao-card[data-id="${id}"]`);
    if (card) {
        card.classList.remove('is-editing');
        const originalText = card.querySelector('.transacao-desc-display').childNodes[0].textContent.trim();
        document.getElementById(`edit-input-${id}`).value = originalText;
    }
}

async function salvarEdicao(id) {
    const input = document.getElementById(`edit-input-${id}`);
    const novaDescricao = input.value.trim();
    
    if (!novaDescricao) {
        alert('A descrição não pode ficar vazia.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ descricao: novaDescricao })
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar transação');
        
        await carregarTransacoes();
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Não foi possível atualizar a descrição.');
        cancelarEdicao(id);
    }
}

async function deletarTransacao(id) {
    if (!confirm('Deseja realmente deletar esta transação?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao deletar transação');
        
        await carregarTransacoes();
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Não foi possível deletar a transação.');
    }
}
