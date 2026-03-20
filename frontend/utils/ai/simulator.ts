
export type SimulationResult = {
    predictedProfitMargin?: number;
    predictedRiskScore?: number;
    deltaProfit?: number;
    deltaRisk?: number;
    explanation: string;
};

// Mock-up of simulation logic. Real logic would query DB for current stats and apply deltas.
// Since we don't have direct DB access in a utility function client-side, this should be server-side or part of an API.
// We'll treat this as a helper used by the Chat Route or a dedicated 'simulate' route.

export function simulateScenario(currentData: any, changes: any): SimulationResult {
    let result: SimulationResult = { explanation: "No significant change detected." };

    // Scenario 1: Price Change
    if (changes.priceIncrease) {
        const currentRev = currentData.total_revenue || 0;
        const currentCost = currentData.total_cost || 0;
        const newRev = currentRev + changes.priceIncrease;

        const oldMargin = currentRev > 0 ? ((currentRev - currentCost) / currentRev) * 100 : 0;
        const newMargin = newRev > 0 ? ((newRev - currentCost) / newRev) * 100 : 0;

        result.predictedProfitMargin = newMargin;
        result.deltaProfit = newMargin - oldMargin;
        result.explanation = `Increasing price by ${changes.priceIncrease} boosts margin from ${oldMargin.toFixed(1)}% to ${newMargin.toFixed(1)}%.`;
    }

    // Scenario 2: Switch Captain
    if (changes.newCaptainScore) {
        // If captain score improves, risk drops.
        // Risk formula involves Capt Score (30% weight).
        // Delta Risk ~= (Old Capt Score - New Capt Score) * Factor
        // Assuming Risk is 0-100 and Captain Score 0-5...
        // Let's say max risk contribution from captain is 30 pts.
        // 5 stars = 0 risk, 1 star = 30 risk.
        // Risk = (5 - Score) * 7.5

        const oldRiskPart = (5 - (currentData.captainScore || 3)) * 7.5;
        const newRiskPart = (5 - changes.newCaptainScore) * 7.5;

        result.deltaRisk = newRiskPart - oldRiskPart; // Negative is good (risk drops)
        result.explanation = `Switching to a captain with score ${changes.newCaptainScore} changes risk by ${result.deltaRisk.toFixed(1)} points.`;
    }

    return result;
}
