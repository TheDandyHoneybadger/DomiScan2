import sqlite3
import json
import os

DATABASE_FILE = 'database.db'
JSON_OUTPUT_FILE = 'dados_offline.json'

def export_database_to_json():
    """
    Lê as tabelas da base de dados SQLite e exporta-as para um ficheiro JSON
    compatível com a aplicação offline, incluindo um número de versão.
    """
    if not os.path.exists(DATABASE_FILE):
        print(f"ERRO: O ficheiro do banco de dados '{DATABASE_FILE}' não foi encontrado.")
        return

    conn = None
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Ler a versão atual do JSON se existir, caso contrário começa em 1.0
        version = 1.0
        if os.path.exists(JSON_OUTPUT_FILE):
            try:
                with open(JSON_OUTPUT_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    version = float(data.get("version", 1.0)) + 0.1
            except (json.JSONDecodeError, FileNotFoundError):
                version = 1.0

        output_data = {
            "version": round(version, 2),
            "products": [],
            "users": [],
            "vendas_log": []
        }

        print(f"A gerar JSON versão: {output_data['version']:.2f}")

        # Exportar tabelas
        tables_to_export = ["products", "users", "vendas_log"]
        for table in tables_to_export:
            print(f"Lendo a tabela '{table}'...")
            try:
                cursor.execute(f"SELECT * FROM {table}")
                rows = cursor.fetchall()
                output_data[table] = [dict(row) for row in rows]
                print(f"-> {len(output_data[table])} registos lidos com sucesso.")
            except sqlite3.OperationalError:
                print(f"-> AVISO: Tabela '{table}' não encontrada. Será criada uma lista vazia.")
                output_data[table] = []

        # Escrever o ficheiro JSON final
        with open(JSON_OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        print("\n--- Processo Concluído! ---")
        print(f"Ficheiro '{JSON_OUTPUT_FILE}' criado/atualizado com sucesso.")

    except Exception as e:
        print(f"\nOcorreu um erro durante o processo: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    export_database_to_json()
