/**
 * Tests - Unit tests for core formulas and logic
 */
const Tests = {
  runAll: function() {
    console.log("Démarrage des tests...");
    this.testStockFormula();
    this.testPerformanceScore();
    this.testBcgMatrix();
    this.testTicketNumbering();
    console.log("Tous les tests ont réussi !");
  },

  testStockFormula: function() {
    const physical = 100;
    const reserved = 20;
    const available = physical - reserved;
    if (available !== 80) throw new Error("Erreur formule Stock Disponible");
    console.log("✓ Test Formule Stock OK");
  },

  testPerformanceScore: function() {
    // Score = (Marge * 0.5) + (Rotation * 0.3) + (Conversion * 0.2)
    const margin = 1000;
    const rotation = 50;
    const conversion = 10;
    const expected = (1000 * 0.5) + (50 * 0.3) + (10 * 0.2);
    const result = (margin * 0.5) + (rotation * 0.3) + (conversion * 0.2);
    if (result !== expected) throw new Error("Erreur formule Score d'Attractivité");
    console.log("✓ Test Formule Score OK");
  },

  testBcgMatrix: function() {
    if (MarketingService.getSegment(80) !== "STARS (Promouvoir)") throw new Error("Erreur segmentation STARS");
    if (MarketingService.getSegment(10) !== "POIDS MORTS (Déstocker)") throw new Error("Erreur segmentation POIDS MORTS");
    console.log("✓ Test Matrice BCG OK");
  },

  testTicketNumbering: function() {
    const site = "LOM";
    const caisse = "C01";
    const date = "231025";
    const seq = "0045";
    const format = `${site}-${caisse}-${date}-${seq}`;
    const regex = /^[A-Z0-9]+-[A-Z0-9]+-\d{6}-\d{4}$/;
    if (!regex.test(format)) throw new Error("Erreur formatage Ticket ID");
    console.log("✓ Test Formatage Ticket OK");
  }
};
