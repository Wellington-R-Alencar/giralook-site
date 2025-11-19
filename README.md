# 🐤 Gira Look — Catálogo Infantil Online  
**Brechó infantil de Cuiabá (MT) • Projeto de Extensão • Site dinâmico com Firebase + Glide + Cloudinary**

![Giralook Banner](assets/img/banner-giralook.png)

---

## 📌 Sobre o Projeto

O **Gira Look** é um brechó infantil localizado em Cuiabá–MT, especializado em roupas novas e semi-novas de 0 a 16 anos, além de brinquedos e acessórios.  

Este repositório contém o desenvolvimento de um **site leve, responsivo e colaborativo**, criado como parte de um **projeto de extensão acadêmica**, permitindo:

- **Catálogo online dinâmico** atualizado via Firebase Firestore  
- **Gerenciamento visual** através do Glide App (privado para equipe)
- **Hospedagem de imagens** otimizadas com Cloudinary (WebP automático)
- **Seção de Desapego** (pré-avaliação de roupas usadas via Google Forms)  
- **Filtros e paginação** client-side com Bootstrap 5
- Conteúdo organizado com foco em **UX**, **colaboração** e **design sustentável**

---

## 🎯 Objetivos

### ✔ Objetivos Gerais
Criar uma solução digital **simples, acessível e colaborativa** que facilite a divulgação das peças do brechó e o processo de desapego, com **zero custo operacional**.

### ✔ Objetivos Específicos
- Implementar uma solução fundamentada no **Modelo 3C de Colaboração** (Comunicação, Coordenação e Cooperação)
- Aplicar práticas de **UX**, **Material Design**, e **Heurísticas de Nielsen**
- Demonstrar o uso de **Design Thinking** na criação de soluções para moda circular
- Preparar arquitetura compatível para **futura migração para WordPress/WooCommerce**

---

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5** + **CSS3** (custom variables para identidade visual)
- **JavaScript ES6+** (módulos, async/await)
- **Bootstrap 5.3** (grid responsivo, componentes)

### Backend/Banco de Dados
- **Firebase Firestore** (NoSQL, queries em tempo real, free tier 50k reads/dia)
- **Firebase Authentication** (Google Sign-in para equipe)
- **Cloud Functions** (backups mensais, alertas de uso)

### Gerenciamento
- **Glide App** (interface visual CRUD para equipe, 3-5 usuários)
- Integração nativa Glide ↔ Firebase Firestore

### Imagens
- **Cloudinary Free Tier** (25GB storage, transformação automática)
- Upload direto client-side via unsigned preset
- Otimização: `f_auto,q_auto,w_800,c_limit` (5MB → WebP)

### Deploy
- **GitHub Pages** (hospedagem estática gratuita)
- HTTPS automático, domínio customizado opcional

---

## 🚀 Funcionalidades

### 🛍️ Catálogo Dinâmico com Filtros
- Carregamento de produtos direto do Firebase Firestore
- Filtros por **categoria** e **faixa etária** (valores dinâmicos)
- Ordenação: mais recentes, mais antigos, menor/maior preço
- **Paginação** de 12 itens com botão "Carregar mais"
- Preço formatado com 2 decimais (BRL)

### 🧸 Seção de Categorias  
Divisão por faixas etárias (0-3, 4-10, 11-16 anos) e tipos de produtos (roupas, calçados, brinquedos, acessórios).

### 🔁 Sistema de Desapego  
Fluxo de pré-avaliação online via Google Forms:
1. Usuário envia fotos e descrição detalhada (defeitos, observações)
2. Loja analisa remotamente
3. Se aprovado, cliente leva peça presencialmente
4. Avaliação final na Giralook (decisão presencial)

### 📍 Páginas Completas
- **Início:** Hero, categorias, destaques, feed Instagram
- **Catálogo:** Filtros, grid responsivo, paginação
- **Desapego:** Formulário Google Forms integrado
- **Sobre:** História, missão, valores, curadoria
- **Contato:** Endereço, horários, WhatsApp, Google Maps, redes sociais

### 🔍 SEO Otimizado
- Meta tags `description`, `keywords` em todas páginas
- Open Graph para compartilhamento redes sociais
- URLs semânticas, imagens com `alt`, lazy loading

---

## 📂 Estrutura do Projeto

```
giralook-site/
├── index.html              # Página inicial
├── catalogo.html           # Catálogo com filtros
├── desapego.html           # Formulário de desapego
├── sobre.html              # História e valores
├── contato.html            # Contato e localização
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos customizados (variáveis CSS)
│   ├── js/
│   │   ├── catalogo.js     # Lógica Firebase + filtros + paginação
│   │   └── config.js       # Credenciais Firebase (substituir)
│   └── img/
│       ├── logo-giralook.png
│       ├── banner-giralook.png
│       └── spinner.gif     # Placeholder loading
├── firebase-functions/     # Cloud Functions (backup + alertas)
│   └── index.js
└── README.md
```

---

## ⚙️ Configuração e Setup

### 1. Clonar o Repositório
```bash
git clone https://github.com/Wellington-R-Alencar/giralook-site.git
cd giralook-site
```

### 2. Configurar Firebase

#### a) Criar Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie novo projeto `giralook-cuiaba`
3. Ative **Firestore Database** (modo produção, região `us-central1`)
4. Ative **Authentication** → Google Sign-in

#### b) Estrutura do Firestore
Criar coleção `produtos` com os campos:

| Campo            | Tipo      | Descrição                          |
|------------------|-----------|------------------------------------|
| `id`             | string    | ID único (auto-gerado)             |
| `nome`           | string    | Nome do produto                    |
| `categoria`      | string    | Ex: "Roupas", "Calçados", etc      |
| `faixa_etaria`   | string    | Ex: "0-3 anos", "4-10 anos"        |
| `tamanho`        | string    | Ex: "P", "M", "G", "2 anos"        |
| `condicao`       | string    | "Novo" ou "Semi-novo"              |
| `preco`          | number    | Valor em float (ex: 45.90)         |
| `imagem_url`     | string    | URL Cloudinary transformada        |
| `descricao`      | string    | Descrição detalhada (opcional)     |
| `status`         | string    | "rascunho", "disponível", "vendido"|
| `criado_em`      | timestamp | Data de criação                    |
| `data_publicacao`| timestamp | Data da última publicação          |

#### c) Índices Compostos
No Firebase Console → Firestore → Indexes, criar:
- `status` (Ascending) + `data_publicacao` (Descending)
- `status` (Ascending) + `categoria` (Ascending) + `data_publicacao` (Descending)
- `status` (Ascending) + `preco` (Ascending)

#### d) Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /produtos/{produtoId} {
      // Leitura pública apenas produtos disponíveis
      allow read: if resource.data.status == 'disponível';
      
      // Escrita apenas usuários autenticados autorizados
      allow write: if request.auth != null && 
                      request.auth.token.email in [
                        'email@gmail.com',
                        'email2@autorizado.com',
                        'email3@autorizado.com'
                      ];
    }
  }
}
```

#### e) Obter Credenciais
No Firebase Console → Project Settings → General → Your apps → Web app:
```javascript
// Copiar e colar em assets/js/config.js
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "giralook-cuiaba.firebaseapp.com",
  projectId: "giralook-cuiaba",
  storageBucket: "giralook-cuiaba.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 3. Configurar Cloudinary

1. Criar conta gratuita em [Cloudinary](https://cloudinary.com/)
2. Dashboard → Settings → Upload → Add upload preset
   - **Preset name:** `giralook_uploads`
   - **Signing Mode:** Unsigned
   - **Folder:** `giralook/produtos`
   - **Transformations:** `f_auto,q_auto,w_800,c_limit`
3. Copiar **Cloud name** e **Preset name** para configurar no Glide

### 4. Configurar Glide App

1. Criar conta em [Glide](https://www.glideapps.com/)
2. New App → conectar ao Firebase Firestore
3. Autenticação: Google Sign-in (whitelist emails da equipe)
4. Criar telas:
   - **Lista de Produtos** (tabela com todos campos)
   - **Adicionar Produto** (formulário com upload imagem)
   - **Editar Produto** (formulário inline)
   - **Botão Publicar** (action: atualizar `status='disponível'` + `data_publicacao=now()`)
5. Integrar upload de imagem:
   - Componente: Image Picker
   - Action: Upload to Cloudinary (preset `giralook_uploads`)
   - Salvar URL retornada em `imagem_url`

### 5. Criar Google Forms de Desapego

1. Google Forms → Novo formulário "Desapego Giralook"
2. Campos:
   - Upload de fotos* (múltiplo, max 5MB)
   - Nome do item* (texto curto)
   - Categoria (dropdown: Roupas, Calçados, Brinquedos, Acessórios)
   - Tamanho (texto curto)
   - Condição* (múltipla escolha: Novo, Semi-novo, Usado)
   - **Descrição detalhada** (parágrafo: "Descreva defeitos, manchas ou observações")
   - Nome completo* (texto curto)
   - WhatsApp* (texto curto com máscara)
3. Respostas → Criar planilha → Sheet `Desapegos_Triagem`
4. Copiar link do Forms e colar em `desapego.html` linha 40

### 6. Deploy GitHub Pages

1. GitHub repo → Settings → Pages
2. Source: Deploy from branch `main`, folder `/` (root)
3. Salvar → aguardar build (2-5 minutos)
4. Site disponível em `https://wellington-r-alencar.github.io/giralook-site/`
5. (Opcional) Custom domain: Settings → Pages → Custom domain

---

## 🔒 Backups e Monitoramento

### Cloud Functions (Firebase)

Criar arquivo `firebase-functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const nodemailer = require('nodemailer');

admin.initializeApp();
const storage = new Storage();
const bucketName = 'giralook-backups';

// Backup mensal automático
exports.backupMensal = functions.pubsub
  .schedule('0 3 1 * *') // Dia 1 de cada mês às 3h
  .timeZone('America/Cuiaba')
  .onRun(async (context) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `backup-${timestamp}.json`;
    
    // Exportar Firestore
    const snapshot = await admin.firestore().collection('produtos').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Salvar no Cloud Storage
    const file = storage.bucket(bucketName).file(fileName);
    await file.save(JSON.stringify(data, null, 2));
    
    // Manter apenas últimos 3 backups (90 dias)
    const [files] = await storage.bucket(bucketName).getFiles();
    if (files.length > 3) {
      const sortedFiles = files.sort((a, b) => 
        a.metadata.timeCreated < b.metadata.timeCreated ? -1 : 1
      );
      await sortedFiles[0].delete();
    }
    
    // Enviar email confirmação
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'seu-email@gmail.com',
        pass: 'senha-app'
      }
    });
    
    await transporter.sendMail({
      from: 'Giralook Backup <noreply@giralook.com>',
      to: 'email@gmail.com',
      subject: `Backup mensal realizado - ${timestamp}`,
      text: `Backup do Firestore realizado com sucesso.\nArquivo: ${fileName}\nTotal de produtos: ${data.length}`
    });
    
    return null;
  });

// Alerta de uso (80% dos limites)
exports.alertaUso = functions.pubsub
  .schedule('0 18 * * *') // Diariamente às 18h
  .timeZone('America/Cuiaba')
  .onRun(async (context) => {
    // Verificar uso (reads e storage)
    const usage = {
      reads: 35000, // Exemplo: buscar de metrics
      storage: 700 // MB
    };
    
    const limites = {
      reads: 50000,
      storage: 1024
    };
    
    if (usage.reads > limites.reads * 0.8 || usage.storage > limites.storage * 0.8) {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: 'seu-email@gmail.com',
          pass: 'senha-app'
        }
      });
      
      await transporter.sendMail({
        from: 'Giralook Alertas <noreply@giralook.com>',
        to: 'lborges.moura@gmail.com',
        subject: '⚠️ Alerta: Uso Firebase acima de 80%',
        html: `
          <h2>Uso do Firebase Firestore</h2>
          <ul>
            <li><strong>Reads:</strong> ${usage.reads.toLocaleString()} / ${limites.reads.toLocaleString()} (${Math.round(usage.reads/limites.reads*100)}%)</li>
            <li><strong>Storage:</strong> ${usage.storage} MB / ${limites.storage} MB (${Math.round(usage.storage/limites.storage*100)}%)</li>
          </ul>
          <p>Considere otimizar queries ou aumentar plano.</p>
        `
      });
    }
    
    return null;
  });
```

### Deploy Cloud Functions
```bash
cd firebase-functions
npm install firebase-functions firebase-admin @google-cloud/storage nodemailer
firebase deploy --only functions
```

---

## 🔄 Migração Futura para WordPress

Este projeto foi desenvolvido com arquitetura compatível para migração:

### 1. Estrutura de Dados
O schema do Firestore é **equivalente** a produtos WooCommerce:
- `preco` → `_price`
- `imagem_url` → `_thumbnail_id` (importar de Cloudinary)
- `categoria` → taxonomy `product_cat`
- `status` → `post_status` (draft/publish)

### 2. Export/Import
- **Exportar:** Cloud Function já gera JSON mensal (`backup-YYYY-MM-DD.json`)
- **Importar WordPress:** Plugin **WP All Import** aceita JSON diretamente
- **Imagens:** Manter Cloudinary (plugin **Cloudinary for WordPress**)

### 3. Funcionalidades WordPress
- Substituir Firebase por **WooCommerce** (produtos nativos)
- Glide App → **Admin WordPress** (dashboard nativo)
- Filtros → **WooCommerce Product Filters** (plugin)
- Desapego → **Contact Form 7** ou **Gravity Forms**

### 4. Manter Identidade Visual
- Exportar `assets/css/style.css` para tema child
- Cores (`:root` variables) → Customizer WordPress
- Layout Bootstrap → Theme Astra/GeneratePress com Bootstrap

---

## 📈 Performance e Limites

### Firebase Free Tier (Spark Plan)
- ✅ **50.000 reads/dia** (suficiente para ~500 visitas/dia com cache)
- ✅ **20.000 writes/dia** (equipe faz ~10-50 updates/dia)
- ✅ **1 GB storage** (comporta ~10.000 registros de produtos)
- ✅ **10 GB/mês transfer** (imagens em Cloudinary, não conta aqui)

### Cloudinary Free Tier
- ✅ **25 GB storage** (~12.500 imagens de 2MB cada)
- ✅ **25 GB bandwidth/mês** (~10.000 visualizações/mês)
- ✅ **Transformações ilimitadas** (WebP, resize automático)

### Otimizações Implementadas
- Lazy loading de imagens (`loading="lazy"`)
- Paginação de 12 itens (reduz reads por visita)
- Filtros client-side (uma query inicial, filtragem em memória)
- Spinner global (feedback visual, UX)

---

## 🤝 Contribuindo

Este é um projeto acadêmico de extensão. Contribuições são bem-vindas:

1. Fork o repositório
2. Crie branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit mudanças (`git commit -m 'Adiciona filtro por preço'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Abra Pull Request

---

## 📄 Licença

Este projeto é de código aberto para fins educacionais e não-comerciais.  
Desenvolvido como parte de projeto de extensão acadêmica em parceria com Giralook Cuiabá.

---

## 📞 Contato

**Giralook Brechó Infantil**  
📍 Cuiabá - MT  
📱 WhatsApp: [Contato](+5565993289806)
📸 Instagram: [@giralook_cuiaba](https://instagram.com/giralook_cuiaba)

**Desenvolvedor:**  
Lucas B. Moura - [Git](https://github.com/lucasmoura333), [Email] (lborges.moura@gmail.com)
Wellington R. Alencar - [Git](https://github.com/Wellington-R-Alencar), [Email] (wellingtonreisalencar@gmail.com)

---

**✨ Moda infantil com carinho, qualidade e sustentabilidade!**
