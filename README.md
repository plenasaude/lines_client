# Requisitos de clientes do sistema de filas de eDoc Saúde


## Requisitos em comum para todos os clientes

[x] Os clientes devem ser entregues na forma de executável, preferencialmente com capacidade de 'over the wire update', para facilitar manutenção. Deve ser possível gerar executáveis para Windows e Linux.

[x] Ao iniciar a aplicação, ela deve ler o arquivo edoc_config.json no diretório root do usuário atual. O arquivo de configuração deve ter o seguinte formato:

```javascript
{
	user: String, // ID do cliente
	authorization: String // chave de acesso
}
```

No caso de não encontrar tal arquivo deve-se exibir uma tela de erro com a menssagem: "Configurações da tela não encontradas".

As comunicações com a API devem ser feitas por HTTPS e enviando a chave de autorização no header 'Authorization'.

No caso de chave de autorização incorreta, a API retornará 403 e o cliente deve exibir uma tela de erro com a frase: "Erro de autenticação, verifique as configurações da aplicação".

Todos os erros da aplicação dever ser logados em edoc_errors.log.

A aplicação deve conseguir detectar se ela está offline, nesse caso ela deve transitar para a tela de erros com a menssagem "Sem conexão com a internet".


### Tela de erro:

A tela de erro é bastante simples, ela deve ter um background neutro (branco ou cinza) e uma área retangular vermelha clara de bordas arredondadas, centralizada vertical e horizontamente na tela.

A menssagem a ser exibida deve poder ser setada externamente, tornado a tela reutilizável para todos os errors da aplicação.



## Requisitos totem

O totem deve ter uma única tela pópria, com 2 botões:

* Normal
* Preferencial

Ao se clicar em um dos botões, um request de um novo ticket deverá ser criado com:

```
POST /tickets
BODY: {
	clientId: String, // chave 'user' do arquivo edoc_config.json
	preferred: Boolean // seta se esse é um ticket preferencial ou nao
}
```

Neste momento o totem deve indicar o estado de 'carregando senha', e não permitir novo clique até acabar.

A resporta da rota POST /tickets tem o formato:

```
{
	ticket: String, // número do ticket
	queue: String, // nome da fila
	preferred: Boolean
}
```

Em caso de sucesso devemos imprimir a resposta recebida. O campo ticket deve ser impresso em tamanho grande e centralizado na linha.
A baixo disso devemos imprimir o nome da fila divido com '-' do tipo de senha. Ex:

```
			001
	fila primeiro andar - preferencial	
```


```
			002
	fila primeiro andar - normal	
```

Em caso de erro, logar resposta em edoc_errors.log e exibir uma mensagem de falha genérica na tela.

Tanto o loading quanto o erro não devem sair da tela com os dois botões, sendo o erro um pop-up temporário.

Ao imprimir a messagem ou resolver o erro, devemos liberar os botões para cliques novamente, voltando ao ciclo de criação de senhas.


## Requisitos TV

Como o totem, a TV também tem uma única tela, nela deve ser exibida uma lista com as últimas N senhas chamadas. Cada linha da lista deve ter a senha, o destino e uma string genérica que pode ser mandada pela API:

```
	SENHA		DESTINO			COMPLEMENTO
	001		GICHE 1
	002		CONSULTÓRIO 1		JOÃO DA SILVA
	003		TRIAGEM 2		MARIA SANTA
				...
```

Linhas preferenciais devem ter algum destaque, pode ser background color ou uma borda vermelha, por exemplo.

O campo de 'COMPLEMENTO' deve tratar strings grandes que não cabem na tela.

A TV deve se manter sincronizada com a API fazendo 1 request por segundo para a rota:

```
	GET /tickets/last?limit=N
	
	Onde N é um número maior que 0,
	esse argumento é opcional e deve ser omitido no momento
```

A resposta para esse request é:

```
[
	{
		ticket: String, // 002
		destination: String, // CONSULTÓRIO 1
		payload: String, // JOÃO DA SILVA
		preferred: Boolean,
		queue: String,
		lastEditedAt: Number
	},
	{ ... }
]
```

Ao receber a resposta com sucesso a TV deve fazer um diff dos dados recebidos com os dados atuais, baseado na combinação das chaves 'ticket' e 'lastEditedAt'. Se não houver diferença nada acontece. Se existir diferença a TV deve renderizar os novos dados ordenados por 'lastEditedAt', destacando quais linhas foram adicionadas, e emitir um sinal sonoro.

Em caso de erro na resposta esse deve ser adicionado a edoc_errors.log e nada mais acontece.

Se todos os pedidos em um prazo de 5min voltarem erro a TV deve transitar para a tela de erros com a menssagem "Erro de conexão com o servidor".


## Especificações genéricas:

A aplicação deve ser feita em electron.

As duas aplicações (totem e TV) podem ser feitas dentro do mesmo projeto e com diferenças apenas no passo de build, uma vez que são bastante semelhantes e devem compartilhar a maior parte do código.

A tecnologia usada para desenvolvimento das views fica a critério do desenvolvedor. Mas, dada a simplicidade da aplicação sugere-se o uso de jquery.

No primeiro momento o totem sempre rodará em máquinas Windowns e a TV em Linux-Raspbian.

Uma forma de recuperar o arquivo de errors remotamente seria interessante.

As aplicações preferencialmente devem obrigar que o arquivo de configuração seja somente leitura.

# Build:

  1. Limpar diretório ./dist
  1.  aumentar a versão do package.json respeitando as regras do SEMVER,
      caso contrário o auto updates quebrará o executável.
  1.  `npm rum dist:win`, Compila a aplicação para Windows 32 e 64.
  1. Pushar o código na master para o Github
  1. Criar uma nova relase, com o nome igual a versão do package.json com v na
     frente. Ou seja versão do package.json 1.0.0, nome do relase v1.0.0
  1. Fazer upload do arquivo .exe e latest.yml dentro da nova versão do Github
  1. Salvar release. Lembre-se que esse passo vai trigar o auto update dos
     programas rodando atualmente, evitar fazer isso em horário comercial. 

