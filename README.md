# 🐍 Configuração do Ambiente Python com Poetry

Este guia descreve como configurar o ambiente Python local com `pyenv`, `pipx` e `poetry`. Ele garante consistência no ambiente entre membros da equipe.

---

## ✅ Pré-requisitos

- Ter `pyenv` instalado (para gerenciar versões do Python)
- Ter `pip` já disponível no sistema

---

## 1. 📌 Definir a versão local do Python

Utilizamos o `pyenv` para definir a versão do Python a ser usada neste projeto:

```bash
pyenv local 3.13.3
```

Isso cria ou atualiza o arquivo `.python-version` com a versão escolhida.

Verifique se a versão está correta:

```bash
python3 -V
# Saída esperada: Python 3.13.3
```

---

## 2. 📦 Instalar o Poetry via pipx

Instalamos o `pipx` (um gerenciador de ferramentas Python) para isolar ferramentas globais:

```bash
python -m pip install pipx
ou pip install pipx
```

Caso o Windows de problema com o pipx execute: 
```bash
python -m pipx ensurepath
```

Depois, usamos o `pipx` para instalar o `Poetry`:

```bash
pipx install poetry
```

### 💡 Injetando plugin no Poetry

Para estender o Poetry com o plugin `poetry-plugin-shell`, utilizamos o comando:

```bash
pipx inject poetry poetry-plugin-shell
```

Isso permite que o Poetry utilize comandos de shell personalizados diretamente nos scripts definidos no `pyproject.toml`.




Verifique se a instalação foi bem-sucedida:

```bash
poetry --version
# Exemplo: Poetry (version 1.8.2)
```

---

## 🎯 Objetivo

O objetivo destes passos é garantir que:

- A versão do Python usada no projeto esteja definida e replicável
- O Poetry esteja disponível globalmente no sistema, mas isolado via `pipx`
- Membros da equipe consigam rodar o projeto de forma consistente

---

## ▶️ Próximos passos sugeridos

Após configurar o ambiente, rode:

```bash
poetry install
```

Esse comando irá instalar todas as dependências listadas no `pyproject.toml`.

---


