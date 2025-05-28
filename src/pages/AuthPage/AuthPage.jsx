// src/pages/AuthPage/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Typography, Card, Spin, message, Tabs } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined, UserOutlined, WhatsAppOutlined, SolutionOutlined } from '@ant-design/icons';
import HeaderAgro from '../../componentsAgro/HeaderAgro/HeaderAgro';
// import FooterLP from '../../componentsLP/FooterLP';
import { useAuth } from '../../context/AuthContext'; // Importa o hook de autenticação
import './AuthPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const logoUrl = "https://i.imgur.com/xOouAUy.png";

// <<< URL BASE DA SUA API BACKEND >>>
const API_BASE_URL = 'https://geral-talismaapi.r954jc.easypanel.host/api/v1'; // Ajuste a URL base da sua API

const AuthPage = () => {
  const navigate = useNavigate();
  const { login: authLogin, user, isAuthenticated } = useAuth(); // Pega a função de login do AuthContext
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Se já estiver autenticado, redireciona para a home do e-commerce
   React.useEffect(() => {
       if (isAuthenticated && user) {
            // Decide para onde redirecionar baseado na role, se necessário
            // if (user.role === 'admin') { navigate('/admin/dashboard', { replace: true }); }
            // else { navigate('/ecommerce', { replace: true }); }
             navigate('/ecommerce', { replace: true }); // Redireciona para a home do e-commerce após login
       }
   }, [isAuthenticated, user, navigate]);


  // --- Handler Login (API) ---
  const onFinishLogin = async (values) => {
    setLoading(true);
    console.log('Tentativa de Login (API):', values);
    try {
        // Chama a função login do AuthContext que agora fará a chamada API
        const loggedInUser = await authLogin(values.email, values.password);

        // A função authLogin no AuthContext já gerencia o estado e exibe mensagens de sucesso/erro
        // Se login foi bem-sucedido (authLogin retornou user), o useEffect acima vai redirecionar

    } catch (error) {
        // O AuthContext já deve tratar a maioria dos erros e mensagens
        console.error("Erro inesperado durante o login:", error);
         if (!error.message.includes('Credenciais inválidas')) { // Evita duplicar mensagem se AuthContext já mostrou
             message.error('Ocorreu um erro ao tentar fazer login.');
         }
    } finally {
        setLoading(false);
    }
  };

  // --- Handler Cadastro (API) ---
  const onFinishRegister = async (values) => {
    setLoading(true);
    console.log('Tentativa de Cadastro (API):', values);
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: values.name,
                email: values.email,
                password: values.password,
                whatsapp_number: values.whatsapp, // Verifique se o nome do campo na API é 'whatsapp_number'
            }),
        });

        const data = await response.json();

        if (response.ok) {
            message.success('Cadastro realizado com sucesso! Faça o login para continuar.');
            setActiveTab('login'); // Muda para a aba de login após cadastro
            registerForm.resetFields(); // Limpa o formulário de cadastro
             // Opcional: Preencher o campo de email do login com o email cadastrado
             loginForm.setFieldsValue({ email: values.email });
        } else {
            // Trata erros da API (ex: email já cadastrado)
            message.error(data.message || 'Erro ao realizar cadastro. Tente novamente.');
        }

    } catch (error) {
        console.error("Erro ao chamar API de cadastro:", error);
        message.error('Erro na comunicação com o servidor.');
    } finally {
        setLoading(false);
    }
  };

  // Handler falha na validação (comum aos dois)
  const onFinishFailed = (errorInfo) => {
    console.log('Falha na validação do formulário:', errorInfo);
    message.error('Por favor, corrija os erros no formulário.');
  };

  return (
    <div className="auth-page-container">
      <HeaderAgro /> {/* Usa HeaderAgro ou um Header mais simples se preferir */}

      <main className="auth-main-content">
        <Card className="auth-form-card">
          <div className="auth-header">
            <img src={logoUrl} alt="AgroStore Logo" className="auth-logo" />
            <Title level={3} className="auth-title">Acesse sua Conta ou Cadastre-se</Title>
             <Paragraph>Entre para ter acesso a descontos exclusivos, acompanhar seus pedidos e gerenciar sua conta.</Paragraph> {/* Adicionado subtítulo */}
          </div>

          <Spin spinning={loading} tip={activeTab === 'login' ? "Entrando..." : "Cadastrando..."}>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                centered
                className="auth-tabs"
            >
              {/* Aba de Login */}
              <TabPane tab="Entrar" key="login">
                <Form
                  form={loginForm}
                  name="login"
                  onFinish={onFinishLogin}
                  onFinishFailed={onFinishFailed}
                  layout="vertical"
                  requiredMark={false}
                  className="auth-antd-form"
                  initialValues={{ remember: true }}
                >
                  <Form.Item
                    name="email" label="E-mail"
                    rules={[{ required: true, message: 'Insira seu e-mail!' }, { type: 'email', message: 'E-mail inválido!' }]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="seu@email.com" size="large"/>
                  </Form.Item>

                  <Form.Item
                    name="password" label="Senha"
                    rules={[{ required: true, message: 'Insira sua senha!' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Sua Senha" size="large"/>
                  </Form.Item>

                  <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Lembrar-me</Checkbox>
                    </Form.Item>
                    {/* Link "Esqueci senha" - Adicione a rota ou modal se necessário */}
                     {/* <Link className="auth-form-forgot" to="/esqueci-senha"> Esqueci minha senha </Link> */}
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" className="auth-submit-button login-button" loading={loading} size="large" block icon={<LoginOutlined />}>
                      Entrar
                    </Button>
                  </Form.Item>
                  <Paragraph className="auth-switch-prompt">
                    Ainda não tem conta?{' '}
                    <Button type="link" onClick={() => setActiveTab('register')} className="switch-link">
                      Cadastre-se aqui!
                    </Button>
                  </Paragraph>
                </Form>
              </TabPane>

              {/* Aba de Cadastro */}
              <TabPane tab="Cadastrar" key="register">
                <Form
                  form={registerForm}
                  name="register"
                  onFinish={onFinishRegister}
                  onFinishFailed={onFinishFailed}
                  layout="vertical"
                  requiredMark={false}
                  className="auth-antd-form"
                >
                  <Form.Item
                    name="name" label="Nome Completo"
                    rules={[{ required: true, message: 'Qual o seu nome?' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Seu nome" size="large"/>
                  </Form.Item>

                  <Form.Item
                    name="email" label="E-mail"
                    rules={[{ required: true, message: 'Precisamos do seu e-mail!' }, { type: 'email', message: 'E-mail inválido!' }]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="seu@email.com" size="large" type="email"/>
                  </Form.Item>

                  <Form.Item
                       name="whatsapp"
                       label="WhatsApp (Opcional)"
                       // Adicione validação mais robusta se necessário
                       // pattern: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/
                       rules={[{ message: 'Número de WhatsApp inválido!' }]}
                       tooltip="Ex: 41987654321 (apenas números)" // Atualizado dica
                    >
                    <Input prefix={<WhatsAppOutlined />} placeholder="Seu número com DDD (apenas números)" size="large" type="tel"/>
                  </Form.Item>

                   <Form.Item
                        name="password"
                        label="Crie uma Senha"
                        rules={[{ required: true, message: 'Crie uma senha segura!' }, { min: 6, message: 'Senha deve ter pelo menos 6 caracteres!' }]} // Adicionado regra min
                        hasFeedback
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mínimo 6 caracteres" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        label="Confirme sua Senha"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Confirme sua senha!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('As senhas não coincidem!'));
                                },
                            }),
                        ]}
                    >
                         <Input.Password prefix={<LockOutlined />} placeholder="Repita a senha" size="large" />
                    </Form.Item>

                  <Form.Item style={{ marginTop: '1.5rem' }}>
                    <Button type="primary" htmlType="submit" className="auth-submit-button register-button" loading={loading} size="large" block icon={<SolutionOutlined />}>
                      Criar Conta
                    </Button>
                  </Form.Item>
                   <Paragraph className="auth-switch-prompt">
                    Já tem conta?{' '}
                    <Button type="link" onClick={() => setActiveTab('login')} className="switch-link">
                      Faça login aqui!
                    </Button>
                  </Paragraph>
                  <Paragraph className="auth-terms-info">
                    Ao se cadastrar, você concorda com nossos <Link to="/termos">Termos</Link> e <Link to="/privacidade">Privacidade</Link>. {/* Adicione estas rotas se necessário */}
                 </Paragraph>
                </Form>
              </TabPane>
            </Tabs>
          </Spin>
        </Card>
      </main>

      {/* Renderiza Footer (ajuste conforme seu componente) */}
       <footer className="placeholder-footer"> E-commerce Footer </footer> {/* Placeholder */}
    </div>
  );
};

export default AuthPage;