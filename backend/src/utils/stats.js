// Utility intentionally unused by routes (candidate should refactor)
function mean(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function computeStats(items) {
  const Items = Array.isArray(items) ? items : [];
  const prices = Items.map((item) => {
    const price = Number(item?.price);
    return Number.isFinite(price) ? price : 0;
  });

  return {
    total: Items.length,
    averagePrice: mean(prices),
  };
}

module.exports = { mean, computeStats };