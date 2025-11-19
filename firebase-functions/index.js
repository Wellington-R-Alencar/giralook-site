/**
 * Cloud Functions para Firebase - Giralook
 * 
 * Funções serverless para backup automático mensal e alertas de uso.
 * Deploy: firebase deploy --only functions
 * 
 * Pré-requisitos:
 * - Firebase CLI instalado (npm install -g firebase-tools)
 * - Projeto Firebase criado e configurado
 * - Billing ativado (mesmo em free tier, necessário para Cloud Functions)
 * 
 * Instalação de dependências:
 * cd firebase-functions
 * npm install firebase-functions firebase-admin @google-cloud/storage nodemailer
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const nodemailer = require('nodemailer');

// Inicializar Firebase Admin SDK
admin.initializeApp();

// Configurações
const storage = new Storage();
const bucketName = 'giralook-backups'; // Criar bucket no Google Cloud Storage
const emailDestinatario = 'lborges.moura@gmail.com';

// Configurar transporter de email (Gmail)
// Para usar: gerar "App Password" no Gmail → https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'seu-email@gmail.com', // SUBSTITUIR com email real
    pass: 'sua-senha-app-aqui'   // SUBSTITUIR com senha de app do Gmail
  }
});

/**
 * Função agendada: Backup mensal automático
 * Executa todo dia 1º de cada mês às 3h (horário Cuiabá)
 * 
 * Ações:
 * 1. Exporta todos documentos da coleção 'produtos' para JSON
 * 2. Salva no Cloud Storage bucket 'giralook-backups'
 * 3. Mantém apenas últimos 3 backups (90 dias)
 * 4. Envia email de confirmação
 */
exports.backupMensal = functions.pubsub
  .schedule('0 3 1 * *') // Cron: minuto hora dia mês dia-da-semana
  .timeZone('America/Cuiaba')
  .onRun(async (context) => {
    try {
      console.log('Iniciando backup mensal...');
      
      // 1. Buscar todos produtos do Firestore
      const snapshot = await admin.firestore().collection('produtos').get();
      const produtos = [];
      
      snapshot.forEach(doc => {
        produtos.push({
          id: doc.id,
          ...doc.data(),
          // Converter timestamps para ISO string (JSON serializable)
          criado_em: doc.data().criado_em?.toDate().toISOString(),
          data_publicacao: doc.data().data_publicacao?.toDate().toISOString()
        });
      });
      
      console.log(`Total de produtos para backup: ${produtos.length}`);
      
      // 2. Preparar nome do arquivo com data
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const fileName = `backup-${timestamp}.json`;
      
      // 3. Salvar no Cloud Storage
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(fileName);
      
      await file.save(JSON.stringify(produtos, null, 2), {
        metadata: {
          contentType: 'application/json',
          metadata: {
            totalProdutos: produtos.length.toString(),
            geradoEm: new Date().toISOString()
          }
        }
      });
      
      console.log(`Backup salvo: ${fileName}`);
      
      // 4. Limpar backups antigos (manter apenas últimos 3)
      const [files] = await bucket.getFiles({ prefix: 'backup-' });
      
      if (files.length > 3) {
        // Ordenar por data de criação (mais antigos primeiro)
        const sortedFiles = files.sort((a, b) => {
          const dateA = new Date(a.metadata.timeCreated);
          const dateB = new Date(b.metadata.timeCreated);
          return dateA - dateB;
        });
        
        // Deletar excedentes (manter últimos 3)
        const filesToDelete = sortedFiles.slice(0, sortedFiles.length - 3);
        
        for (const fileToDelete of filesToDelete) {
          await fileToDelete.delete();
          console.log(`Backup antigo deletado: ${fileToDelete.name}`);
        }
      }
      
      // 5. Enviar email de confirmação
      await transporter.sendMail({
        from: '"Giralook Backup" <noreply@giralook.com>',
        to: emailDestinatario,
        subject: `✅ Backup mensal realizado - ${timestamp}`,
        text: `Backup do Firestore realizado com sucesso.\n\nArquivo: ${fileName}\nTotal de produtos: ${produtos.length}\nData: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' })}`,
        html: `
          <h2>Backup Mensal Giralook</h2>
          <p>Backup do Firestore realizado com sucesso!</p>
          <ul>
            <li><strong>Arquivo:</strong> ${fileName}</li>
            <li><strong>Total de produtos:</strong> ${produtos.length}</li>
            <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' })}</li>
            <li><strong>Backups mantidos:</strong> ${Math.min(files.length, 3)} (últimos 90 dias)</li>
          </ul>
          <p><small>Este backup está armazenado no Google Cloud Storage bucket <code>${bucketName}</code>.</small></p>
        `
      });
      
      console.log('Email de confirmação enviado');
      return null;
      
    } catch (error) {
      console.error('Erro no backup mensal:', error);
      
      // Enviar email de erro
      await transporter.sendMail({
        from: '"Giralook Backup" <noreply@giralook.com>',
        to: emailDestinatario,
        subject: '❌ Erro no backup mensal',
        text: `Erro ao realizar backup: ${error.message}`,
        html: `
          <h2>Erro no Backup Mensal</h2>
          <p>Ocorreu um erro ao realizar o backup automático:</p>
          <pre>${error.message}</pre>
          <p>Verifique os logs no Firebase Console.</p>
        `
      });
      
      throw error;
    }
  });

/**
 * Função agendada: Alerta de uso Firebase
 * Executa diariamente às 18h (horário Cuiabá)
 * 
 * Ações:
 * 1. Verifica uso de reads e storage do Firestore
 * 2. Se atingir 80% dos limites, envia email de alerta
 * 
 * Nota: Em produção, buscar métricas reais da Firebase Admin API
 * Esta implementação usa valores simulados para demonstração
 */
exports.alertaUso = functions.pubsub
  .schedule('0 18 * * *') // Diariamente às 18h
  .timeZone('America/Cuiaba')
  .onRun(async (context) => {
    try {
      console.log('Verificando uso do Firebase...');
      
      // Limites do Free Tier (Spark Plan)
      const limites = {
        reads: 50000,      // 50k reads/dia
        storage: 1024      // 1GB storage
      };
      
      // TODO: Em produção, buscar métricas reais usando Firebase Admin API
      // Por ora, simulando valores para demonstração
      // Exemplo real: usar Cloud Monitoring API ou Firebase Usage API
      
      // Buscar estatísticas básicas do Firestore
      const snapshot = await admin.firestore().collection('produtos').get();
      const totalDocumentos = snapshot.size;
      
      // Estimativa conservadora de uso
      // Assumindo ~100 reads por documento por dia (queries, listagens)
      const estimativaReads = totalDocumentos * 100;
      
      // Calcular tamanho aproximado do storage
      // Firestore cobra ~1KB por documento + tamanho dos campos
      const estimativaStorage = (totalDocumentos * 5) / 1024; // ~5KB por produto (estimativa)
      
      const uso = {
        reads: estimativaReads,
        storage: Math.round(estimativaStorage)
      };
      
      console.log(`Uso estimado - Reads: ${uso.reads}, Storage: ${uso.storage}MB`);
      
      // Verificar se atingiu 80% dos limites
      const percentualReads = (uso.reads / limites.reads) * 100;
      const percentualStorage = (uso.storage / limites.storage) * 100;
      
      const alertar = percentualReads > 80 || percentualStorage > 80;
      
      if (alertar) {
        console.log('⚠️ Limites acima de 80%, enviando alerta...');
        
        await transporter.sendMail({
          from: '"Giralook Alertas" <noreply@giralook.com>',
          to: emailDestinatario,
          subject: '⚠️ Alerta: Uso Firebase acima de 80%',
          text: `Uso do Firebase Firestore\n\nReads: ${uso.reads.toLocaleString()} / ${limites.reads.toLocaleString()} (${Math.round(percentualReads)}%)\nStorage: ${uso.storage} MB / ${limites.storage} MB (${Math.round(percentualStorage)}%)\n\nConsidere otimizar queries ou aumentar plano.`,
          html: `
            <h2>⚠️ Alerta de Uso Firebase</h2>
            <p>O uso do Firebase Firestore ultrapassou 80% dos limites do plano gratuito:</p>
            <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th>Recurso</th>
                  <th>Uso Atual</th>
                  <th>Limite Free</th>
                  <th>Percentual</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: ${percentualReads > 80 ? '#fff3cd' : '#fff'};">
                  <td><strong>Reads (dia)</strong></td>
                  <td>${uso.reads.toLocaleString()}</td>
                  <td>${limites.reads.toLocaleString()}</td>
                  <td><strong>${Math.round(percentualReads)}%</strong></td>
                </tr>
                <tr style="background: ${percentualStorage > 80 ? '#fff3cd' : '#fff'};">
                  <td><strong>Storage</strong></td>
                  <td>${uso.storage} MB</td>
                  <td>${limites.storage} MB</td>
                  <td><strong>${Math.round(percentualStorage)}%</strong></td>
                </tr>
              </tbody>
            </table>
            <h3>Recomendações:</h3>
            <ul>
              <li>Implementar cache client-side (localStorage) para reduzir reads</li>
              <li>Otimizar queries (usar índices compostos)</li>
              <li>Revisar frequência de acesso ao catálogo</li>
              <li>Considerar upgrade para plano Blaze (pay-as-you-go)</li>
            </ul>
            <p><small>Este alerta é enviado diariamente às 18h quando uso &gt; 80%.</small></p>
          `
        });
        
        console.log('Email de alerta enviado');
      } else {
        console.log('✅ Uso dentro dos limites normais');
      }
      
      return null;
      
    } catch (error) {
      console.error('Erro ao verificar uso:', error);
      throw error;
    }
  });

/**
 * Função HTTP (opcional): Trigger manual de backup
 * URL: https://us-central1-[PROJECT-ID].cloudfunctions.net/backupManual
 * 
 * Uso: Para criar backups sob demanda fora do agendamento mensal
 */
exports.backupManual = functions.https.onRequest(async (req, res) => {
  try {
    // Reutilizar lógica do backup mensal
    const snapshot = await admin.firestore().collection('produtos').get();
    const produtos = [];
    
    snapshot.forEach(doc => {
      produtos.push({
        id: doc.id,
        ...doc.data(),
        criado_em: doc.data().criado_em?.toDate().toISOString(),
        data_publicacao: doc.data().data_publicacao?.toDate().toISOString()
      });
    });
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const fileName = `backup-manual-${timestamp}.json`;
    
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    
    await file.save(JSON.stringify(produtos, null, 2));
    
    res.status(200).json({
      success: true,
      message: 'Backup manual realizado com sucesso',
      arquivo: fileName,
      totalProdutos: produtos.length
    });
    
  } catch (error) {
    console.error('Erro no backup manual:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
