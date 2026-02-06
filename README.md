# Hoppscotch to Postman Converter

Uma ferramenta simples e eficiente para converter coleções e ambientes exportados do Hoppscotch para o formato compatível com o Postman (v2.1).

## 🚀 Funcionalidades

- **Conversão Automática**: Detecta automaticamente se o arquivo é uma Coleção ou um Ambiente.
- **Suporte a Múltiplas Coleções**: Suporta arquivos JSON contendo arrays de coleções (exportação em massa), gerando arquivos individuais para cada coleção.
- **Organização**: Mantém seus arquivos organizados, lendo de uma pasta de entrada e salvando em uma pasta de saída dedicada.

## 🛠️ Como usar

### 1. Preparação
Certifique-se de ter as dependências instaladas:
```bash
npm install
```

### 2. Coloque seus arquivos
Exporte seus arquivos `.json` do Hoppscotch e coloque-os na pasta:
`hoppscotch_exported_files/`

> **Nota**: Você pode colocar arquivos de Environment, Collections individuais ou arquivos contendo múltiplas Collections.

### 3. Execute a conversão
No terminal, execute:
```bash
npm start
```

### 4. Resultado
Os arquivos convertidos estarão disponíveis na pasta:
`postman_converted_files/`

Os arquivos serão nomeados automaticamente:
- **Coleções**: `nome_original_postman_collection.json`
- **Ambientes**: `nome_original_postman_environment.json`
- **Múltiplas Coleções**: `nome_arquivo_nome_colecao_index_postman_collection.json`

## ✅ Testes

Para garantir que tudo está funcionando corretamente, você pode rodar os testes automatizados:
```bash
npm test
```

## 📝 Estrutura do Projeto

- `src/`: Código fonte do conversor.
- `hoppscotch_exported_files/`: Pasta de entrada (coloque seus arquivos aqui).
- `postman_converted_files/`: Pasta de saída (arquivos convertidos aparecem aqui).
- `test/`: Testes automatizados.
