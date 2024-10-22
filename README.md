# Discord Bot README

このリポジトリは、Discord Botの作成に必要な手順をまとめたものです。このBotは、読み上げ機能と認証機能を備えています。

## 必要な環境

- Node.js（バージョン 14.x 以上推奨）
- npm（Node Package Manager）

## 環境のセットアップ

### 1. Node.jsのインストール

1. [Node.jsの公式サイト](https://nodejs.org/)にアクセスし、最新のLTS（長期サポート）バージョンをダウンロードしてインストールします。

2. インストールが完了したら、以下のコマンドをターミナルで実行して、インストールが成功したことを確認します。

   ```bash
   node -v
   npm -v
```
```bash
   npm install discord.js @google-cloud/text-to-speech @discordjs/voice ffmpeg-static
