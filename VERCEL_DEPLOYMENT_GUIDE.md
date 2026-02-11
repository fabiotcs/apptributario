# 🚀 Guia de Publicação na Vercel

## 📋 Pré-requisitos

- [ ] Conta GitHub (já possui: fabiotcs)
- [ ] Conta Vercel (https://vercel.com/signup)
- [ ] Repositório GitHub conectado

---

## 🎯 Passo 1: Criar Projeto no Vercel

### Opção A: Via Dashboard Web (Recomendado)

1. Acesse https://vercel.com/new
2. Clique em "Import Project"
3. Selecione GitHub como provedor
4. Autorize o Vercel a acessar seus repositórios
5. Selecione: `fabiotcs/apptributario`
6. Clique em "Import"

### Opção B: Via Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Fazer login
vercel login

# Deploy do projeto
cd C:\meu-projeto\apps\web
vercel --prod
```

---

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

No dashboard do Vercel, acesse:
**Settings → Environment Variables**

Adicione as seguintes variáveis:

### Variáveis Obrigatórias:

```
DATABASE_URL = "postgresql://user:password@host:port/database"
NEXTAUTH_SECRET = "seu-secret-key-aqui-min-32-caracteres"
NEXTAUTH_URL = "https://seu-dominio.vercel.app"
```

### Variáveis Opcionais:

```
NODE_ENV = "production"
NEXT_PUBLIC_API_URL = "https://seu-dominio.vercel.app/api"
```

---

## 🔧 Passo 3: Configurar Build Settings

No Vercel Dashboard:
**Settings → Build & Development Settings**

```
Framework: Next.js (auto-detectado)
Build Command: npm run build
Output Directory: .next
Root Directory: ./apps/web
Install Command: npm ci --legacy-peer-deps
```

---

## 🗄️ Passo 4: Configurar Banco de Dados

Você precisa de um banco de dados PostgreSQL:

### Opção A: Vercel Postgres (Recomendado)

1. No dashboard Vercel, acesse **Storage**
2. Clique em **Create Database**
3. Selecione **Postgres**
4. Siga as instruções para criar
5. Copie a `DATABASE_URL`
6. Adicione em Environment Variables

### Opção B: Banco Externo

Se já possui um banco PostgreSQL:
1. Obtenha a connection string
2. Adicione em Environment Variables
3. Certifique-se que está acessível da internet

---

## 🚀 Passo 5: Fazer o Deploy

### Via Dashboard (Automático):

1. Após configurar tudo, clique **Deploy**
2. Aguarde o build completar (5-10 minutos)
3. Dashboard mostrará o progresso

### Via CLI (Manual):

```bash
# Na pasta raiz do projeto
vercel --prod --yes
```

---

## ✅ Passo 6: Verificação Pós-Deploy

Após o deploy, verifique:

- [ ] **Frontend carrega** - Acesse https://seu-projeto.vercel.app
- [ ] **Página inicial funciona**
- [ ] **Login funciona** (se aplicável)
- [ ] **API endpoints respondem** - GET /api/v1/health
- [ ] **Banco de dados conecta** - Teste uma query
- [ ] **Variáveis de ambiente estão corretas** - Verifique logs

### Checklist de Testes:

```bash
# Testar frontend
curl https://seu-projeto.vercel.app

# Testar API
curl https://seu-projeto.vercel.app/api/v1/

# Ver logs em tempo real
vercel logs seu-projeto --follow
```

---

## 📊 Monitoramento Pós-Deploy

### Dashboard Vercel:

- **Analytics** - Performance e traffic
- **Logs** - Erros e informações
- **Deployments** - Histórico de versões
- **Settings** - Gerenciar configurações

### Alertas:

Configure notificações para:
- Build falhou
- Deploy falhou
- Erros em tempo de execução

---

## 🔄 Deploy Contínuo (CI/CD)

O Vercel detecta commits no master e faz deploy automático:

1. ✅ Push para master
2. ✅ Vercel detecta mudança
3. ✅ Build automático inicia
4. ✅ Testes correm (se configurado)
5. ✅ Deploy automático após sucesso

---

## ❌ Troubleshooting

### Build Failed

**Erro**: "npm ERR! code ERESOLVE"
```bash
Solução: Adicione na build command:
npm ci --legacy-peer-deps
```

**Erro**: "DATABASE_URL não encontrada"
```bash
Solução: Verifique Environment Variables
```

### Runtime Errors

**Erro**: "Cannot find module"
```bash
Solução: npm install --save <package-name>
```

### Database Connection

**Erro**: "P1002 - Cannot reach database"
```bash
Solução:
1. Verifique DATABASE_URL
2. Teste conexão localmente
3. Verifique firewall/IP whitelist
```

---

## 📞 Suporte

- **Docs Vercel**: https://vercel.com/docs
- **Community**: https://vercel.com/support
- **Status**: https://www.vercelstatus.com

---

## 🎉 Pronto!

Após completar todos os passos:

✅ Projeto publicado na Vercel
✅ CI/CD automático ativado
✅ Monitoramento configurado
✅ Pronto para produção

**URL de Produção**: https://seu-projeto.vercel.app

---

**Última atualização**: 2026-02-10
**Versão**: 1.0
