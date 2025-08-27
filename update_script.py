import sqlite3
import json
import os
import sys
import hashlib
from datetime import datetime

DATABASE_FILE = 'database.db'
JSON_OUTPUT_FILE = 'dados_offline.json'

def hash_password(password):
    """Gera um hash SHA256 para a senha."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def apply_changes(cursor, changes_data):
    """Aplica as alterações de produtos e utilizadores na base de dados."""
    print("A processar alterações de dados (changes)...")
    for change in changes_data.get('changes', []):
        action = change.get("action")
        details = change.get("details")
        
        if action == "create_user":
            username = details.get('username')
            password_hash = details.get('password')
            role = details.get('role')
            cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
            if not cursor.fetchone():
                cursor.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                               (username, password_hash, role))
                print(f"   - Utilizador '{username}' criado.")
        
        elif action == "pair_product" or action == "edit_barcode":
            cod = details.get("cod")
            new_barcode = details.get("newBarcode")
            new_stock = details.get("newStock")

            if cod and new_barcode:
                cursor.execute("UPDATE products SET barcode = ? WHERE cod = ?", (new_barcode, cod))
                print(f"   - Barcode do produto '{cod}' atualizado para '{new_barcode}'.")
            
            if cod and new_stock is not None:
                cursor.execute("UPDATE products SET estoque = ? WHERE cod = ?", (new_stock, cod))
                print(f"   - Estoque do produto '{cod}' atualizado para '{new_stock}'.")

        elif action == "adjust_stock":
             cod = details.get("cod")
             new_stock = details.get("newStock")
             if cod and new_stock is not None:
                cursor.execute("UPDATE products SET estoque = ? WHERE cod = ?", (new_stock, cod))
                print(f"   - Estoque do produto '{cod}' ajustado para '{new_stock}'.")

    print(f"-> {len(changes_data.get('changes', []))} alterações processadas.")

def apply_sales(cursor, sales_data):
    """Insere novos registos de vendas no log, evitando duplicados."""
    print("A processar registos de vendas...")
    
    # Obter todos os timestamps existentes para uma verificação rápida
    cursor.execute("SELECT timestamp FROM vendas_log")
    existing_timestamps = {row[0] for row in cursor.fetchall()}
    
    new_sales_count = 0
    for sale in sales_data.get('sales', []):
        timestamp = sale.get('timestamp')
        if not timestamp:
            print("   - AVISO: Venda sem timestamp encontrada. A ignorar.")
            continue

        # Insere apenas se o timestamp não existir
        if timestamp not in existing_timestamps:
            venda_data = (
                timestamp,
                sale.get("vendedor"),
                sale.get("produtos"),
                sale.get("formas_pagamento"),
                sale.get("valores_pagos"),
                sale.get("desconto", 0),
                sale.get("total")
            )
            cursor.execute("""
                INSERT INTO vendas_log 
                (timestamp, vendedor, produtos, formas_pagamento, valores_pagos, desconto, valor_total) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, venda_data)
            new_sales_count += 1
    
    print(f"-> {new_sales_count} novas vendas inseridas.")


def export_database_to_json(conn):
    """Exporta o estado atual da base de dados para o ficheiro JSON."""
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Ler a versão atual para incrementá-la
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
        "products": [], "users": [], "vendas_log": []
    }
    
    print(f"\nA gerar novo ficheiro JSON versão: {output_data['version']:.2f}")

    # Exportar tabelas
    tables_to_export = ["products", "users", "vendas_log"]
    for table in tables_to_export:
        try:
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            output_data[table] = [dict(row) for row in rows]
        except sqlite3.OperationalError:
            print(f"-> AVISO: Tabela '{table}' não encontrada. Será criada uma lista vazia.")
            output_data[table] = []
    
    with open(JSON_OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"-> Ficheiro '{JSON_OUTPUT_FILE}' atualizado com sucesso.")


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
