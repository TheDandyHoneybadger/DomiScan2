import sqlite3
import json
import os
import sys
import hashlib

DATABASE_FILE = 'database.db'
JSON_OUTPUT_FILE = 'dados_offline.json'

def hash_password(password)
    Gera um hash SHA256 para a senha.
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def apply_changes(cursor, changes_data)
    Aplica as alterações de produtos e utilizadores na base de dados.
    for change in changes_data.get('changes', [])
        action = change.get(action)
        details = change.get(details)
        
        if action == create_user
            # A senha já vem com hash do cliente
            cursor.execute(INSERT OR IGNORE INTO users (username, password, role) VALUES (, , ),
                           (details['username'], details['password'], details['role']))
        
        elif action == pair_product
            cursor.execute(UPDATE products SET barcode =  WHERE cod = ,
                           (details['newBarcode'], details['cod']))
        
        # Adicionar outras lógicas de 'change' aqui
    
    print(f- {len(changes_data.get('changes', []))} alterações de dados processadas.)

def apply_sales(cursor, sales_data)
    Insere novos registos de vendas no log.
    sales_log = sales_data.get('sales', [])
    for sale in sales_log
        # Uma verificação simples para evitar duplicados exatos
        cursor.execute(SELECT rowid FROM vendas_log WHERE timestamp =  AND vendedor = , (sale['timestamp'], sale['vendedor']))
        if not cursor.fetchone()
            cursor.execute(
                INSERT INTO vendas_log (timestamp, vendedor, produtos, formas_pagamento, valores_pagos, desconto, valor_total)
                VALUES (, , , , , , )
            , (
                sale['timestamp'], sale['vendedor'], sale['produtos'],
                sale['formas_pagamento'], sale['valores_pagos'],
                sale['desconto'], sale['valor_total']
            ))
    print(f- {len(sales_log)} registos de vendas processados.)


def export_database_to_json(conn)
    Exporta o estado atual da base de dados para o ficheiro JSON.
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    output_data = {
        products [], users [], vendas_log []
    }
    
    cursor.execute(SELECT  FROM products)
    output_data[products] = [dict(row) for row in cursor.fetchall()]
    
    cursor.execute(SELECT  FROM users)
    output_data[users] = [dict(row) for row in cursor.fetchall()]

    cursor.execute(SELECT  FROM vendas_log)
    output_data[vendas_log] = [dict(row) for row in cursor.fetchall()]
    
    with open(JSON_OUTPUT_FILE, 'w', encoding='utf-8') as f
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f- Ficheiro '{JSON_OUTPUT_FILE}' atualizado com sucesso.)


if __name__ == __main__
    # O GitHub Actions irá passar os dados como o primeiro argumento
    if len(sys.argv)  2
        print(ERRO Nenhum dado de alteração foi fornecido.)
        sys.exit(1)
        
    changes_json_string = sys.argv[1]
    try
        all_changes = json.loads(changes_json_string)
    except json.JSONDecodeError
        print(ERRO Os dados de entrada não são um JSON válido.)
        sys.exit(1)

    conn = None
    try
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        
        apply_changes(cursor, all_changes)
        apply_sales(cursor, all_changes)
        
        conn.commit()
        
        # Após aplicar as alterações, exporta a DB inteira para o JSON
        export_database_to_json(conn)
        
    except sqlite3.Error as e
        print(fERRO de base de dados {e})
        if conn
            conn.rollback()
        sys.exit(1)
    finally
        if conn
            conn.close()

    print(nProcesso de atualização da base de dados concluído com sucesso.)
