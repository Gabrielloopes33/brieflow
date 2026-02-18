# 🚀 COMANDOS FINAIS - Solução Completa

## ✅ Resumo da Situação

Você tem:
- ✅ Docker Swarm rodando
- ✅ Stack briefflow rodando
- ✅ Servidor na porta 5001
- ✅ Chaves do Supabase configuradas
- ❌ Falta: Interface de login funcional

---

## 🎯 O Que Precisa Fazer

Execute na VPS:

### Passo 1: Copiar o script

```bash
cd /opt/brieflow

# Criar o script de atualização
cat > add-auth-ui.sh << 'SCRIPT_EOF'
#!/bin/bash

set -e

echo "🔐 === ADICIONANDO INTERFACE DE LOGIN DO SUPABASE ==="
echo ""

cd /opt/brieflow

echo "📝 Criando página de autenticação..."
cat > client/src/pages/Auth.tsx << 'AUTH_EOF'
import { useState } from 'react';
import { useNavigate } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@shared/supabase';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setSuccess('Login realizado com sucesso!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setSuccess('Cadastro realizado! Verifique seu email para confirmar.');
      
      if (data.session) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: '${window.location.origin}/auth/reset-password',
      });

      if (error) throw error;

      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = mode === 'login' ? handleLogin :
                      mode === 'signup' ? handleSignup :
                      handleForgotPassword;

  const title = mode === 'login' ? 'Entrar na sua conta' :
                 mode === 'signup' ? 'Criar nova conta' :
                 'Recuperar senha';

  const description = mode === 'login' ? 'Insira suas credenciais para acessar o BriefFlow' :
                      mode === 'signup' ? 'Crie uma conta para começar a usar o BriefFlow' :
                      'Digite seu email para receber um link de recuperação';

  const buttonText = mode === 'login' ? 'Entrar' :
                    mode === 'signup' ? 'Criar conta' :
                    'Enviar email de recuperação';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>BriefFlow</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {mode === 'login' && 'Preencha com suas credenciais'}
              {mode === 'signup' && 'Todos os campos são obrigatórios'}
              {mode === 'forgot-password' && 'Você receberá um email com instruções'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    {buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center w-full">
              {mode === 'login' && (
                <>
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Criar conta
                  </button>
                </>
              )}

              {mode === 'signup' && (
                <>
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Entrar
                  </button>
                </>
              )}

              {mode === 'forgot-password' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Voltar para o login
                  </button>
                </>
              )}
            </div>

            {mode === 'login' && (
              <div className="text-sm text-center w-full">
                <button
                  type="button"
                  onClick={() => { setMode('forgot-password'); setError(''); setSuccess(''); }}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
AUTH_EOF

echo "✅ Página de autenticação criada!"
echo ""

echo "🔄 Atualizando App.tsx..."
# Adicionar import do Auth
sed -i '/^import Landing from "\/pages\/Landing";$/a import Auth from "@/pages/Auth";' client/src/App.tsx

# Adicionar rota /auth
sed -i '/<Route path="\/" component={Landing} \/>/a\      <Route path="\/auth" component={Auth} />' client/src/App.tsx

echo "✅ App.tsx atualizado!"
echo ""

echo "🔄 Atualizando Landing.tsx..."
# Alterar para usar navegação em vez de window.location
sed -i 's/window.location.href = "\/api\/login"/navigate("\/auth")/g' client/src/Landing.tsx

echo "✅ Landing.tsx atualizado!"
echo ""

echo "🧹 Limpando cache..."
rm -rf dist .vite
echo "✅ Cache limpo!"
echo ""

echo "🏗️  Executando build..."
npx vite build --config vite.config.ts --mode production
echo ""

echo "✅ === INTERFACE DE LOGIN ADICIONADA ==="
echo ""
echo "🚀 Próximo passo:"
echo "   docker service scale brielflow_app=0 && docker service scale brielflow_app=1"
echo ""
echo "✨ Agora você pode criar usuários reais no Supabase!"
echo ""
SCRIPT_EOF

chmod +x add-auth-ui.sh
```

### Passo 2: Executar o script

```bash
./add-auth-ui.sh
```

### Passo 3: Reiniciar o container

```bash
docker service scale brielflow_app=0 && docker service scale brielflow_app=1
```

### Passo 4: Testar

1. Acesse: `http://seu-servidor:5001`
2. Clique em "Fazer Login"
3. Crie uma conta ou faça login
4. Acesse o dashboard!

---

## ✅ Resultado Final

Você terá:
- ✅ Interface de login completa
- ✅ Cadastro de usuários
- ✅ Recuperação de senha
- ✅ Autenticação real com Supabase
- ✅ Sistema funcionando 100%

---

**Execute os comandos acima e aproveite sua aplicação!** 🎉
