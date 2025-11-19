// Firebase SDK v9 - Importação modular
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, query, where, orderBy, limit, startAfter, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { firebaseConfig } from './config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Estado da aplicação
let ultimoDoc = null;
let carregando = false;
let filtroAtual = {
  categoria: '',
  faixaEtaria: '',
  ordenacao: 'data-desc'
};

// Elementos DOM
const listaProdutos = document.getElementById('lista-produtos');
const btnCarregarMais = document.getElementById('btn-carregar-mais');
const spinner = document.getElementById('loading-spinner');
const filtroCategoria = document.getElementById('filtro-categoria');
const filtroFaixa = document.getElementById('filtro-faixa');
const filtroOrdenacao = document.getElementById('filtro-ordenacao');

// Mostrar/ocultar spinner
function toggleSpinner(mostrar) {
  spinner.style.display = mostrar ? 'block' : 'none';
}

// Formatar preço para exibição (sempre 2 decimais)
function formatarPreco(preco) {
  return preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Renderizar um card de produto
function renderizarCard(produto) {
  const col = document.createElement('div');
  col.className = 'col-lg-2 col-md-4 col-6';
  
  col.innerHTML = `
    <article class="card-produto">
      <img src="${produto.imagem_url}" alt="${produto.nome}" loading="lazy">
      <h3>${produto.nome}</h3>
      <p class="categoria">${produto.categoria} • ${produto.condicao}</p>
      <p class="tamanho">Tamanho: ${produto.tamanho}</p>
      <p class="preco">${formatarPreco(produto.preco)}</p>
    </article>
  `;
  
  // TODO: Implementar modal com imagem ampliada, descrição completa e botão WhatsApp "Tenho interesse"
  
  return col;
}

// Construir query Firestore baseada nos filtros
function construirQuery(paginacao = false) {
  let q = query(collection(db, 'produtos'), where('status', '==', 'disponível'));
  
  // Filtro categoria
  if (filtroAtual.categoria) {
    q = query(q, where('categoria', '==', filtroAtual.categoria));
  }
  
  // Filtro faixa etária
  if (filtroAtual.faixaEtaria) {
    q = query(q, where('faixa_etaria', '==', filtroAtual.faixaEtaria));
  }
  
  // Ordenação
  switch (filtroAtual.ordenacao) {
    case 'data-desc':
      q = query(q, orderBy('data_publicacao', 'desc'));
      break;
    case 'data-asc':
      q = query(q, orderBy('data_publicacao', 'asc'));
      break;
    case 'preco-asc':
      q = query(q, orderBy('preco', 'asc'));
      break;
    case 'preco-desc':
      q = query(q, orderBy('preco', 'desc'));
      break;
  }
  
  // Paginação
  if (paginacao && ultimoDoc) {
    q = query(q, startAfter(ultimoDoc));
  }
  
  q = query(q, limit(12));
  
  return q;
}

// Carregar produtos
async function carregarProdutos(limpar = false) {
  if (carregando) return;
  
  carregando = true;
  toggleSpinner(true);
  btnCarregarMais.style.display = 'none';
  
  if (limpar) {
    listaProdutos.innerHTML = '';
    ultimoDoc = null;
  }
  
  try {
    const q = construirQuery(!limpar);
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      if (limpar) {
        listaProdutos.innerHTML = '<div class="col-12 text-center"><p>Nenhum produto encontrado.</p></div>';
      }
      toggleSpinner(false);
      carregando = false;
      return;
    }
    
    snapshot.forEach(doc => {
      const produto = { id: doc.id, ...doc.data() };
      const card = renderizarCard(produto);
      listaProdutos.appendChild(card);
    });
    
    ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
    
    // Mostrar botão "Carregar mais" se há mais resultados
    if (snapshot.docs.length === 12) {
      btnCarregarMais.style.display = 'block';
    }
    
  } catch (erro) {
    console.error('Erro ao carregar produtos:', erro);
    listaProdutos.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Erro ao carregar produtos. Tente novamente.</p></div>';
  } finally {
    toggleSpinner(false);
    carregando = false;
  }
}

// Carregar valores únicos para dropdowns
async function carregarFiltrosDinamicos() {
  try {
    // Buscar todas categorias únicas
    const qCategorias = query(
      collection(db, 'produtos'),
      where('status', '==', 'disponível')
    );
    const snapshotCat = await getDocs(qCategorias);
    const categorias = new Set();
    const faixas = new Set();
    
    snapshotCat.forEach(doc => {
      const data = doc.data();
      if (data.categoria) categorias.add(data.categoria);
      if (data.faixa_etaria) faixas.add(data.faixa_etaria);
    });
    
    // Popular dropdown categorias
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      filtroCategoria.appendChild(option);
    });
    
    // Popular dropdown faixas
    faixas.forEach(faixa => {
      const option = document.createElement('option');
      option.value = faixa;
      option.textContent = faixa;
      filtroFaixa.appendChild(option);
    });
    
  } catch (erro) {
    console.error('Erro ao carregar filtros:', erro);
  }
}

// Event listeners
filtroCategoria.addEventListener('change', (e) => {
  filtroAtual.categoria = e.target.value;
  carregarProdutos(true);
});

filtroFaixa.addEventListener('change', (e) => {
  filtroAtual.faixaEtaria = e.target.value;
  carregarProdutos(true);
});

filtroOrdenacao.addEventListener('change', (e) => {
  filtroAtual.ordenacao = e.target.value;
  carregarProdutos(true);
});

btnCarregarMais.addEventListener('click', () => {
  carregarProdutos(false);
});

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await carregarFiltrosDinamicos();
  await carregarProdutos(true);
});
