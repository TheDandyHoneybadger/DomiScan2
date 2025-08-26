import sqlite3
import json
import os
import sys
import hashlib

DATABASE_FILE = 'database.db'
JSON_OUTPUT_FILE = 'dados_offline.json'

def increment_version(version_string):
    """
    Incrementa o último número de uma string de versão (ex: '0.0.1' -> '0.0.2').
    """
    try:
        parts = list(map(int, version_string.split('.')))
        parts[-1] += 1
        return '.'.join(map(str, parts))
    except (ValueError, IndexError):
        # Se o formato for inválido, retorna uma nova versão baseada em timestamp
        return f"1.{int(time.time())}"

def apply_changes(cursor, changes_data):
    """Aplica as alterações de produtos e utilizadores na base de dados."""
    for change in changes_data.get('changes', []):
        action = change.get('action')
        details = change.get('details')
        
        if action == 'create_user':
            cursor.execute("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)",
                           (details['username'], details['password'], details['role']))
        
        elif action == 'pair_product':
            cursor.execute("UPDATE products SET barcode = ? WHERE cod = ?",
                           (details['newBarcode'], details['cod']))
        
        # Adicionar outras lógicas de 'change' aqui
    
    print(f"- {len(changes_data.get('changes', []))} alterações de dados processadas.")

def apply_sales(cursor, sales_data):
    """Insere novos registos de vendas no log."""
    sales_log = sales_data.get('sales', [])
    for sale in sales_log:
        cursor.execute("SELECT rowid FROM vendas_log WHERE timestamp = ? AND vendedor = ?", (sale['timestamp'], sale['vendedor']))
        if not cursor.fetchone():
            cursor.execute(
                """INSERT INTO vendas_log (timestamp, vendedor, produtos, formas_pagamento, valores_pagos, desconto, valor_total)
                VALUES (?, ?, ?, ?, ?, ?, ?)""", (
                sale['timestamp'], sale['vendedor'], sale['produtos'],
                sale['formas_pagamento'], sale['valores_pagos'],
                sale['desconto'], sale['valor_total']
            ))
    print(f"- {len(sales_log)} registos de vendas processados.")


def export_database_to_json(conn):
    """Exporta o estado atual da base de dados para o ficheiro JSON, incrementando a versão."""
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    version = "0.0.0.0.0.0"
    if os.path.exists(JSON_OUTPUT_FILE):
        try:
            with open(JSON_OUTPUT_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                version = data.get("version", "0.0.0.0.0.0")
        except (json.JSONDecodeError, FileNotFoundError):
            pass

    new_version = increment_version(version)
    
    output_data = {
        "version": new_version,
        "products": [], "users": [], "vendas_log": []
    }
    
    cursor.execute("SELECT * FROM products")
    output_data["products"] = [dict(row) for row in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM users")
    output_data["users"] = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM vendas_log")
    output_data["vendas_log"] = [dict(row) for row in cursor.fetchall()]
    
    with open(JSON_OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"- Ficheiro '{JSON_OUTPUT_FILE}' atualizado com sucesso para a versão {new_version}.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("ERRO: Nenhum dado de alteração foi fornecido.")
        sys.exit(1)
        
    changes_json_string = sys.argv[1]
    try:
        all_changes = json.loads(changes_json_string)
    except json.JSONDecodeError:
        print("ERRO: Os dados de entrada não são um JSON válido.")
        sys.exit(1)

    conn = None
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        
        apply_changes(cursor, all_changes)
        apply_sales(cursor, all_changes)
        
        conn.commit()
        
        export_database_to_json(conn)
        
    except sqlite3.Error as e:
        print(f"ERRO de base de dados: {e}")
        if conn:
            conn.rollback()
        sys.exit(1)
    finally:
        if conn:
            conn.close()

    print("\nProcesso de atualização da base de dados concluído com sucesso.")
