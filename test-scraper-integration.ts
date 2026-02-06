/**
 * Script de teste da integração scraper
 * Testa a comunicação entre Node.js e Python scraper
 */

import {
  checkScraperHealth,
  startScraping,
  getTaskStatus,
  testSource,
} from "./server/services/scraper";

async function runTests() {
  console.log("🧪 Testando integração do Scraper...\n");

  // Test 1: Health Check
  console.log("Test 1: Verificando saúde do scraper...");
  try {
    const isHealthy = await checkScraperHealth();
    if (isHealthy) {
      console.log("✅ Scraper está respondendo!\n");
    } else {
      console.log("❌ Scraper não está respondendo\n");
      process.exit(1);
    }
  } catch (error) {
    console.log("❌ Erro ao verificar saúde:", error);
    console.log("\n💡 Certifique-se de que o scraper está rodando:");
    console.log("   cd scraper && python src/api/server.py\n");
    process.exit(1);
  }

  // Test 2: Testar fonte
  console.log("Test 2: Testando uma fonte RSS...");
  try {
    const result = await testSource(
      "https://rss.cnn.com/rss/edition.rss",
      "rss"
    );
    if (result.success) {
      console.log("✅ Fonte testada com sucesso!");
      console.log(`   Título: ${result.feed_info?.title}`);
      console.log(`   Entradas: ${result.feed_info?.entries_count}\n`);
    } else {
      console.log("⚠️  Fonte retornou erro:", result.message, "\n");
    }
  } catch (error) {
    console.log("❌ Erro ao testar fonte:", error, "\n");
  }

  console.log("✅ Testes concluídos!");
  console.log("\n📖 Para usar a integração:");
  console.log("   1. Inicie o scraper: cd scraper && python src/api/server.py");
  console.log("   2. Inicie o backend: npm run dev");
  console.log("   3. Acesse: http://localhost:5000/api/scraper/health");
  console.log("\n🚀 Ou inicie tudo de uma vez: ./start-briefflow.sh");
}

runTests();
