#!/usr/bin/env python3
"""
BriefFlow Scraper - Versão Mínima para Teste
API simples sem dependências complexas
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sqlite3
import sys
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import datetime

class SimpleAPIHandler(BaseHTTPRequestHandler):
    """Handler HTTP simples para o scraper"""
    
    def do_GET(self):
        """Processar requisições GET"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                "status": "running",
                "service": "BriefFlow Scraper API (Simple)",
                "timestamp": datetime.datetime.now().isoformat(),
                "version": "1.0.0-simple"
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        elif parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                "status": "healthy",
                "service": "BriefFlow Scraper API",
                "timestamp": datetime.datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        elif parsed_path.path == '/info':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                "name": "BriefFlow Content Scraper",
                "version": "1.0.0-simple",
                "description": "API simplificada para coleta de conteúdo",
                "endpoints": [
                    "/",
                    "/health",
                    "/info",
                    "/test-db"
                ]
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        elif parsed_path.path == '/test-db':
            # Testar conexão com banco de dados
            try:
                db_path = Path(__file__).parent.parent / "data" / "briefflow.db"
                conn = sqlite3.connect(str(db_path))
                cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = [row[0] for row in cursor.fetchall()]
                conn.close()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {
                    "database_path": str(db_path),
                    "tables": tables,
                    "status": "connected"
                }
                self.wfile.write(json.dumps(response, indent=2).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {"error": str(e)}
                self.wfile.write(json.dumps(response, indent=2).encode())
                
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"error": "Endpoint not found"}
            self.wfile.write(json.dumps(response, indent=2).encode())
    
    def do_POST(self):
        """Processar requisições POST"""
        parsed_path = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        if parsed_path.path == '/echo':
            # Echo endpoint para teste
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                response = {
                    "echo": data,
                    "received_at": datetime.datetime.now().isoformat()
                }
                self.wfile.write(json.dumps(response, indent=2).encode())
            except json.JSONDecodeError:
                response = {"error": "Invalid JSON"}
                self.wfile.write(json.dumps(response, indent=2).encode())
                
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"error": "Endpoint not found"}
            self.wfile.write(json.dumps(response, indent=2).encode())
    
    def log_message(self, format, *args):
        """Sobrescrever log para simplificar"""
        print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {format % args}")

def main():
    """Função principal"""
    port = 8000
    server_address = ('127.0.0.1', port)
    
    print("=" * 60)
    print("BriefFlow Scraper - Versão Simples para Teste")
    print("=" * 60)
    print(f"Servidor iniciado em http://127.0.0.1:{port}")
    print("Endpoints disponíveis:")
    print(f"  http://127.0.0.1:{port}/ - Status")
    print(f"  http://127.0.0.1:{port}/health - Health check")
    print(f"  http://127.0.0.1:{port}/info - Informações")
    print(f"  http://127.0.0.1:{port}/test-db - Teste do banco")
    print(f"  http://127.0.0.1:{port}/echo - Echo POST")
    print("=" * 60)
    print("Pressione CTRL+C para parar")
    print()
    
    try:
        httpd = HTTPServer(server_address, SimpleAPIHandler)
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado")
    except Exception as e:
        print(f"Erro ao iniciar servidor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()