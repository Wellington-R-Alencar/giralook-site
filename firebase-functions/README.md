# Cloud Functions - Giralook

Este diretório contém as **Cloud Functions do Firebase** para automação de backup e monitoramento.

## 📦 Funções Disponíveis

### 1. `backupMensal`
**Trigger:** Agendado (Pub/Sub)  
**Frequência:** Mensal (dia 1 às 3h)  
**Ação:** Exporta todos produtos do Firestore para JSON, salva no Cloud Storage, mantém últimos 3 backups (90 dias), envia email de confirmação.

### 2. `alertaUso`
**Trigger:** Agendado (Pub/Sub)  
**Frequência:** Diário (18h)  
**Ação:** Verifica uso de reads e storage do Firestore, envia email se atingir 80% dos limites.

### 3. `backupManual` (opcional)
**Trigger:** HTTP Request  
**Ação:** Backup sob demanda acessível via URL.

## 🚀 Setup

### 1. Pré-requisitos
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login
```

### 2. Inicializar Projeto
```bash
# No diretório raiz do projeto
firebase init functions

# Selecionar:
# - Use existing project (giralook-cuiaba)
# - JavaScript
# - ESLint: No (opcional)
# - Install dependencies: Yes
```

### 3. Configurar Variáveis
Editar `firebase-functions/index.js`:
- Substituir `seu-email@gmail.com` pelo email real
- Substituir `sua-senha-app-aqui` por [App Password do Gmail](https://myaccount.google.com/apppasswords)
- Confirmar `bucketName = 'giralook-backups'`

### 4. Criar Bucket Cloud Storage
```bash
# No console Firebase → Storage → Create bucket
# Nome: giralook-backups
# Região: us-central1 (mesma das functions)
```

### 5. Instalar Dependências
```bash
cd firebase-functions
npm install
```

### 6. Deploy
```bash
# Deploy apenas functions (não altera Firestore/Hosting)
firebase deploy --only functions

# Ou deploy função específica
firebase deploy --only functions:backupMensal
```

## 🧪 Teste Local

### Emulador Firebase
```bash
cd firebase-functions
npm run serve

# Acessar: http://localhost:5001/giralook-cuiaba/us-central1/backupManual
```

### Testar Backup Manual
```bash
# Via curl
curl https://us-central1-giralook-cuiaba.cloudfunctions.net/backupManual

# Resposta esperada:
# {
#   "success": true,
#   "message": "Backup manual realizado com sucesso",
#   "arquivo": "backup-manual-2025-11-18T15-30-00.json",
#   "totalProdutos": 42
# }
```

## 📊 Monitoramento

### Ver Logs
```bash
# Todos logs
firebase functions:log

# Logs específicos
firebase functions:log --only backupMensal

# Seguir logs em tempo real
firebase functions:log --follow
```

### Dashboard Firebase
Console Firebase → Functions → Ver execuções, erros, duração

## 💰 Custos

### Free Tier (Spark Plan) - Grátis
- ❌ **Cloud Functions não disponíveis** (requer Blaze Plan)

### Blaze Plan (Pay-as-you-go) - Gratuito até limites
- ✅ **2 milhões invocações/mês** grátis
- ✅ **400.000 GB-segundos compute** grátis
- ✅ **200.000 GHz-segundos compute** grátis
- ✅ **5 GB egress/mês** grátis

**Estimativa Giralook (uso real):**
- Backup mensal: 1 invocação/mês (1-2s duração) = **$0.00**
- Alerta diário: 30 invocações/mês (0.5s duração) = **$0.00**
- **Total mensal estimado: $0.00** (dentro do free tier)

## 🔒 Segurança

### Proteger Função HTTP (backupManual)
Para evitar acessos não autorizados, adicionar validação:

```javascript
exports.backupManual = functions.https.onRequest(async (req, res) => {
  // Validar token ou IP
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'SUA_CHAVE_SECRETA') {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  // ... resto do código
});
```

### Environment Variables
Armazenar credenciais sensíveis:
```bash
firebase functions:config:set gmail.email="seu-email@gmail.com"
firebase functions:config:set gmail.password="senha-app"

# Usar no código:
const email = functions.config().gmail.email;
```

## 🐛 Troubleshooting

### Erro: "Billing account not configured"
**Solução:** Ativar Blaze Plan no Firebase Console → Upgrade project

### Erro: "Permission denied (Cloud Storage)"
**Solução:** 
```bash
# Dar permissão ao service account
# IAM → Add → <PROJECT-ID>@appspot.gserviceaccount.com
# Role: Storage Admin
```

### Email não está sendo enviado
**Verificar:**
1. App Password do Gmail está correto
2. "Less secure app access" habilitado (se não usar App Password)
3. Logs do Firebase para mensagens de erro detalhadas

## 📅 Agendamento Personalizado

### Alterar Frequência de Backup
```javascript
// Mensal → Semanal (todo domingo 3h)
.schedule('0 3 * * 0')

// Mensal → Quinzenal (dias 1 e 15)
.schedule('0 3 1,15 * *')

// Diário às 2h
.schedule('0 2 * * *')
```

Referência: [Cron syntax](https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules)

## 📚 Recursos

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Cloud Scheduler Cron Syntax](https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Cloud Storage Node.js Client](https://cloud.google.com/nodejs/docs/reference/storage/latest)

---

**Desenvolvido para Giralook - Moda Infantil com Carinho**
