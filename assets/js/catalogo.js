async function carregarProdutos() {
  try {
    const resp = await fetch(PRODUTOS_SHEET_URL);
    const csv = await resp.text();

    const linhas = csv.trim().split('\n');
    const cabecalho = linhas.shift().split(',');

    const produtos = linhas.map(linha => {
      const cols = linha.split(',');
      const obj = {};
      cabecalho.forEach((col, i) => {
        obj[col.trim()] = (cols[i] || '').trim();
      });
      return obj;
    });

    renderizarProdutos(produtos);
  } catch (e) {
    console.error('Erro ao carregar produtos:', e);
  }
}

function renderizarProdutos(produtos) {
  const container = document.getElementById('lista-produtos');
  container.innerHTML = '';

  produtos
    .filter(p => p.status && p.status.toLowerCase() === 'disponível')
    .forEach(p => {
      const card = document.createElement('article');
      card.className = 'card-produto';
      card.innerHTML = `
        <img src="${p.imagem}" alt="${p.nome}">
        <h3>${p.nome}</h3>
        <p class="categoria">${p.categoria} • ${p.condicao}</p>
        <p class="tamanho">Tamanho: ${p.tamanho}</p>
        <p class="preco">R$ ${Number(p.preco || 0).toFixed(2)}</p>
      `;
      container.appendChild(card);
    });
}

carregarProdutos();
